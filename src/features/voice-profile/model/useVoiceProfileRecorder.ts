'use client';

import { useEffect, useRef, useState } from 'react';
import {
  countPcmSamples,
  createPcmCapture,
  ensureAacEncodingSupported,
  flushPcmCapture,
  PCM_SAMPLE_RATE,
  releasePcmCapture,
  startPcmCapture,
  UnsupportedRecordingBrowserError,
  type PcmCapture,
} from '@/shared/lib';
import { getMinSentenceSamples, VOICE_PROFILE_SCRIPT } from './voice-profile-script';
import {
  analyzePcmChunk,
  EMPTY_VOICE_QUALITY_TRACKER,
  evaluateVoiceQuality,
  startNextSentence,
  trackPcmChunk,
  type VoiceQualityWarning,
} from './voice-quality';

export type VoiceProfileRecorderStatus =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'finishing'
  | 'completed'
  | 'denied'
  | 'unsupported'
  | 'unavailable';

interface RecorderState {
  status: VoiceProfileRecorderStatus;
  sentenceIndex: number;
  recordedCount: number;
  sentenceSamples: number;
  totalSamples: number;
  qualityWarning: VoiceQualityWarning | null;
}

const INITIAL_STATE: RecorderState = {
  status: 'idle',
  sentenceIndex: 0,
  recordedCount: 0,
  sentenceSamples: 0,
  totalSamples: 0,
  qualityWarning: null,
};

const LAST_SENTENCE_INDEX = VOICE_PROFILE_SCRIPT.length - 1;

const toFailureStatus = (error: unknown): VoiceProfileRecorderStatus => {
  if (error instanceof UnsupportedRecordingBrowserError) return 'unsupported';
  if (
    error instanceof DOMException &&
    (error.name === 'NotAllowedError' || error.name === 'SecurityError')
  ) {
    return 'denied';
  }
  return 'unavailable';
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

  useEffect(
    () => () => {
      sessionRef.current += 1;
      releaseCapture();
    },
    [],
  );

  const handleChunk = (session: number) => (chunk: ArrayBuffer) => {
    if (session !== sessionRef.current) return;
    const samples = countPcmSamples(chunk);
    const pcm = new Int16Array(chunk);
    sentenceChunksRef.current[recordingIndexRef.current].push(pcm);
    qualityTrackerRef.current = trackPcmChunk(qualityTrackerRef.current, analyzePcmChunk(pcm));
    const qualityWarning = evaluateVoiceQuality(qualityTrackerRef.current);
    setState((current) => ({
      ...current,
      sentenceSamples: current.sentenceSamples + samples,
      totalSamples: current.totalSamples + samples,
      qualityWarning,
    }));
  };

  const start = async () => {
    const session = ++sessionRef.current;
    releaseCapture();
    setState({ ...INITIAL_STATE, status: 'requesting' });

    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new UnsupportedRecordingBrowserError();
      await ensureAacEncodingSupported();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (session !== sessionRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      let capture: PcmCapture;
      try {
        capture = await createPcmCapture(stream);
      } catch (error) {
        stream.getTracks().forEach((track) => track.stop());
        throw error;
      }
      if (session !== sessionRef.current) {
        releasePcmCapture(capture);
        return;
      }

      captureRef.current = capture;
      recordingIndexRef.current = 0;
      sentenceChunksRef.current = VOICE_PROFILE_SCRIPT.map(() => []);
      qualityTrackerRef.current = EMPTY_VOICE_QUALITY_TRACKER;
      startPcmCapture(capture, handleChunk(session));
      setState((current) => ({ ...current, status: 'recording' }));
    } catch (error) {
      if (session !== sessionRef.current) return;
      setState({ ...INITIAL_STATE, status: toFailureStatus(error) });
    }
  };

  const finish = async (session: number) => {
    setState((current) => ({ ...current, status: 'finishing' }));
    const capture = captureRef.current;
    if (capture) await flushPcmCapture(capture).catch(() => {});
    if (session !== sessionRef.current) return;

    releaseCapture();
    setState((current) => ({
      ...current,
      status: 'completed',
      recordedCount: VOICE_PROFILE_SCRIPT.length,
      qualityWarning: null,
    }));
  };

  const next = () => {
    const { status, sentenceIndex, recordedCount, sentenceSamples } = state;
    if (status !== 'recording') return;

    if (sentenceIndex < recordedCount) {
      setState((current) => ({ ...current, sentenceIndex: current.sentenceIndex + 1 }));
      return;
    }
    if (sentenceSamples < getMinSentenceSamples(sentenceIndex)) return;
    if (sentenceIndex === LAST_SENTENCE_INDEX) {
      void finish(sessionRef.current);
      return;
    }

    recordingIndexRef.current = sentenceIndex + 1;
    qualityTrackerRef.current = startNextSentence(qualityTrackerRef.current);
    setState((current) => ({
      ...current,
      sentenceIndex: current.sentenceIndex + 1,
      recordedCount: current.recordedCount + 1,
      sentenceSamples: 0,
    }));
  };

  const previous = () => {
    if (state.status !== 'recording' || state.sentenceIndex === 0) return;
    setState((current) => ({ ...current, sentenceIndex: current.sentenceIndex - 1 }));
  };

  const reset = () => {
    sessionRef.current += 1;
    releaseCapture();
    recordingIndexRef.current = 0;
    sentenceChunksRef.current = [];
    qualityTrackerRef.current = EMPTY_VOICE_QUALITY_TRACKER;
    setState(INITIAL_STATE);
  };

  return {
    status: state.status,
    sentenceIndex: state.sentenceIndex,
    recordedSentences: VOICE_PROFILE_SCRIPT.map((_, index) => index < state.recordedCount),
    sentenceProgress:
      state.recordedCount < VOICE_PROFILE_SCRIPT.length
        ? state.sentenceSamples / getMinSentenceSamples(state.recordedCount)
        : 1,
    elapsedSeconds: Math.floor(state.totalSamples / PCM_SAMPLE_RATE),
    qualityWarning: state.qualityWarning,
    start,
    next,
    previous,
    reset,
  };
};
