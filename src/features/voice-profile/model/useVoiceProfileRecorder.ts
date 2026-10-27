'use client';

import { useEffect, useRef, useState } from 'react';
import {
  captureException,
  countPcmSamples,
  flushPcmCapture,
  releasePcmCapture,
  startPcmCapture,
  type PcmCapture,
} from '@/shared/lib';
import {
  openVoiceProfileCapture,
  toCaptureFailure,
  type VoiceProfileCaptureFailure,
} from './voice-profile-capture';
import { buildVoiceProfileFile } from './voice-profile-file';
import {
  addRecordedSamples,
  completeAllSentences,
  getElapsedSeconds,
  getNextSentenceStep,
  getRecordedSentences,
  getSentenceProgress,
  INITIAL_VOICE_PROFILE_PROGRESS,
  recordNextSentence,
  viewNextSentence,
  viewPreviousSentence,
  type VoiceProfileProgress,
} from './voice-profile-progress';
import { VOICE_PROFILE_SCRIPT } from './voice-profile-script';
import {
  analyzePcmChunk,
  EMPTY_VOICE_QUALITY_TRACKER,
  evaluateVoiceQuality,
  startNextSentence,
  trackPcmChunk,
  type VoiceQualityWarning,
} from './voice-quality';
import { EMPTY_WAVE_LEVELS, pushWaveLevel } from './voice-wave';

export type VoiceProfileRecorderStatus =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'finishing'
  | 'completed'
  | 'fileFailed'
  | VoiceProfileCaptureFailure;

interface RecorderState {
  status: VoiceProfileRecorderStatus;
  progress: VoiceProfileProgress;
  qualityWarning: VoiceQualityWarning | null;
  waveLevels: number[];
  file: File | null;
}

const INITIAL_STATE: RecorderState = {
  status: 'idle',
  progress: INITIAL_VOICE_PROFILE_PROGRESS,
  qualityWarning: null,
  waveLevels: EMPTY_WAVE_LEVELS,
  file: null,
};

export const useVoiceProfileRecorder = () => {
  const [state, setState] = useState(INITIAL_STATE);
  const sessionRef = useRef(0);
  const captureRef = useRef<PcmCapture | null>(null);
  const recordingIndexRef = useRef(0);
  const sentenceChunksRef = useRef<Int16Array[][]>([]);
  const qualityTrackerRef = useRef(EMPTY_VOICE_QUALITY_TRACKER);

  const releaseCapture = () => {
    if (captureRef.current) releasePcmCapture(captureRef.current);
    captureRef.current = null;
  };

  const clearRecording = () => {
    recordingIndexRef.current = 0;
    sentenceChunksRef.current = VOICE_PROFILE_SCRIPT.map(() => []);
    qualityTrackerRef.current = EMPTY_VOICE_QUALITY_TRACKER;
  };

  useEffect(
    () => () => {
      sessionRef.current += 1;
      releaseCapture();
    },
    [],
  );

  const handleChunk = (session: number) => (chunk: ArrayBuffer) => {
    if (session !== sessionRef.current) return;
    const pcm = new Int16Array(chunk);
    sentenceChunksRef.current[recordingIndexRef.current].push(pcm);
    const stats = analyzePcmChunk(pcm);
    qualityTrackerRef.current = trackPcmChunk(qualityTrackerRef.current, stats);
    const qualityWarning = evaluateVoiceQuality(qualityTrackerRef.current);
    setState((current) => ({
      ...current,
      progress: addRecordedSamples(current.progress, countPcmSamples(chunk)),
      qualityWarning,
      waveLevels: pushWaveLevel(current.waveLevels, stats.levelDb),
    }));
  };

  const start = async () => {
    const session = ++sessionRef.current;
    releaseCapture();
    setState({ ...INITIAL_STATE, status: 'requesting' });

    try {
      const capture = await openVoiceProfileCapture(() => session !== sessionRef.current);
      if (!capture) return;

      captureRef.current = capture;
      clearRecording();
      startPcmCapture(capture, handleChunk(session));
      setState((current) => ({ ...current, status: 'recording' }));
    } catch (error) {
      if (session !== sessionRef.current) return;
      setState({ ...INITIAL_STATE, status: toCaptureFailure(error) });
    }
  };

  const finish = async (session: number) => {
    setState((current) => ({ ...current, status: 'finishing' }));
    const capture = captureRef.current;
    if (capture) await flushPcmCapture(capture).catch(() => {});
    if (session !== sessionRef.current) return;

    releaseCapture();
    try {
      const file = await buildVoiceProfileFile(sentenceChunksRef.current);
      if (session !== sessionRef.current) return;
      sentenceChunksRef.current = [];
      setState((current) => ({
        ...current,
        status: 'completed',
        progress: completeAllSentences(current.progress),
        qualityWarning: null,
        file,
      }));
    } catch (error) {
      if (session !== sessionRef.current) return;
      captureException(error, { tags: { feature: 'voice-profile-file' } });
      setState((current) => ({ ...current, status: 'fileFailed', qualityWarning: null }));
    }
  };

  const next = () => {
    if (state.status !== 'recording') return;

    const step = getNextSentenceStep(state.progress);
    if (step === 'blocked') return;
    if (step === 'finish') {
      void finish(sessionRef.current);
      return;
    }
    if (step === 'record') {
      recordingIndexRef.current = state.progress.sentenceIndex + 1;
      qualityTrackerRef.current = startNextSentence(qualityTrackerRef.current);
    }
    setState((current) => ({
      ...current,
      progress:
        step === 'record'
          ? recordNextSentence(current.progress)
          : viewNextSentence(current.progress),
    }));
  };

  const previous = () => {
    if (state.status !== 'recording') return;
    setState((current) => ({ ...current, progress: viewPreviousSentence(current.progress) }));
  };

  const reset = () => {
    sessionRef.current += 1;
    releaseCapture();
    clearRecording();
    setState(INITIAL_STATE);
  };

  return {
    status: state.status,
    sentenceIndex: state.progress.sentenceIndex,
    recordedSentences: getRecordedSentences(state.progress),
    sentenceProgress: getSentenceProgress(state.progress),
    elapsedSeconds: getElapsedSeconds(state.progress),
    qualityWarning: state.qualityWarning,
    waveLevels: state.waveLevels,
    file: state.file,
    start,
    next,
    previous,
    reset,
  };
};
