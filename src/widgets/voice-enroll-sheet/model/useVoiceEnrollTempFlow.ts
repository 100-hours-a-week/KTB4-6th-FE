'use client';

import { useEffect, useRef, useState } from 'react';
import type { VoiceEnrollPhase } from './types';
import { VOICE_PROFILE_SCRIPT } from '@/features/voice-profile';

const WAVE_BAR_COUNT = 18;
const TICK_MS = 100;
const MS_PER_CHARACTER = 130;
const PROCESSING_MS = 1600;

const createWaveLevels = () => Array.from({ length: WAVE_BAR_COUNT }, () => Math.random());
const IDLE_WAVE_LEVELS: number[] = Array(WAVE_BAR_COUNT).fill(0);
const NO_RECORDED_SENTENCES: boolean[] = VOICE_PROFILE_SCRIPT.map(() => false);

const markRecorded = (recorded: boolean[], index: number) =>
  recorded.map((item, itemIndex) => itemIndex === index || item);

interface RecordingClock {
  startedAt: number;
  sentenceStartedAt: number;
  now: number;
}

export const useVoiceEnrollTempFlow = () => {
  const [phase, setPhase] = useState<VoiceEnrollPhase>('idle');
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [recordedSentences, setRecordedSentences] = useState(NO_RECORDED_SENTENCES);
  const [clock, setClock] = useState<RecordingClock | null>(null);
  const [waveLevels, setWaveLevels] = useState(IDLE_WAVE_LEVELS);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const processingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTimers = () => {
    if (tickTimer.current) clearInterval(tickTimer.current);
    if (processingTimer.current) clearTimeout(processingTimer.current);
    tickTimer.current = null;
    processingTimer.current = null;
  };

  useEffect(() => stopTimers, []);

  const restartSentenceClock = () =>
    setClock((current) => current && { ...current, sentenceStartedAt: Date.now() });

  const process = () => {
    stopTimers();
    setPhase('processing');
    processingTimer.current = setTimeout(() => setPhase('done'), PROCESSING_MS);
  };

  const start = () => {
    stopTimers();
    const now = Date.now();
    setPhase('recording');
    setSentenceIndex(0);
    setRecordedSentences(NO_RECORDED_SENTENCES);
    setClock({ startedAt: now, sentenceStartedAt: now, now });
    tickTimer.current = setInterval(() => {
      setClock((current) => current && { ...current, now: Date.now() });
      setWaveLevels(createWaveLevels());
    }, TICK_MS);
  };

  const next = () => {
    const isNewlyRecorded = !recordedSentences[sentenceIndex];
    setRecordedSentences(markRecorded(recordedSentences, sentenceIndex));
    if (sentenceIndex === VOICE_PROFILE_SCRIPT.length - 1) {
      process();
      return;
    }
    setSentenceIndex(sentenceIndex + 1);
    if (isNewlyRecorded) restartSentenceClock();
  };

  const previous = () => {
    if (sentenceIndex === 0) return;
    setSentenceIndex(sentenceIndex - 1);
  };

  const reset = () => {
    stopTimers();
    setPhase('idle');
    setSentenceIndex(0);
    setRecordedSentences(NO_RECORDED_SENTENCES);
    setClock(null);
    setWaveLevels(IDLE_WAVE_LEVELS);
  };

  const recordingIndex = Math.max(0, recordedSentences.indexOf(false));
  const sentenceDuration = VOICE_PROFILE_SCRIPT[recordingIndex].length * MS_PER_CHARACTER;

  return {
    phase,
    sentenceIndex,
    recordedSentences,
    sentenceProgress: clock ? (clock.now - clock.sentenceStartedAt) / sentenceDuration : 0,
    elapsedSeconds: clock ? Math.floor((clock.now - clock.startedAt) / 1000) : 0,
    waveLevels,
    start,
    next,
    previous,
    retry: process,
    reset,
  };
};
