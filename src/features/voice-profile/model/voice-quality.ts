export type VoiceQualityWarning = 'clipping' | 'no-speech' | 'too-quiet' | 'noisy';

export interface PcmChunkStats {
  levelDb: number;
  clippedRatio: number;
}

export interface VoiceQualityTracker {
  recent: PcmChunkStats[];
  sentenceChunks: number;
  sentenceSpeechChunks: number;
  warning: VoiceQualityWarning | null;
  warningHoldChunks: number;
}

const INT16_FULL_SCALE = 32_768;
const CLIPPED_SAMPLE = 32_000;
const SILENCE_DB = -100;

const RECENT_CHUNKS = 30;
const MIN_RECENT_CHUNKS = 15;
const SPEECH_DB = -40;
const CLIPPING_RATIO = 0.02;
const NO_SPEECH_MIN_CHUNKS = 30;
const NO_SPEECH_RATIO = 0.08;
const WARNING_HOLD_CHUNKS = 30;

export const EMPTY_VOICE_QUALITY_TRACKER: VoiceQualityTracker = {
  recent: [],
  sentenceChunks: 0,
  sentenceSpeechChunks: 0,
  warning: null,
  warningHoldChunks: 0,
};

export const analyzePcmChunk = (samples: Int16Array): PcmChunkStats => {
  if (samples.length === 0) return { levelDb: SILENCE_DB, clippedRatio: 0 };

  let sumOfSquares = 0;
  let clipped = 0;
  for (const sample of samples) {
    sumOfSquares += sample * sample;
    if (Math.abs(sample) >= CLIPPED_SAMPLE) clipped += 1;
  }
  const rms = Math.sqrt(sumOfSquares / samples.length) / INT16_FULL_SCALE;

  return {
    levelDb: rms > 0 ? Math.max(SILENCE_DB, 20 * Math.log10(rms)) : SILENCE_DB,
    clippedRatio: clipped / samples.length,
  };
};

const detectVoiceQuality = ({
  recent,
  sentenceChunks,
  sentenceSpeechChunks,
}: VoiceQualityTracker): VoiceQualityWarning | null => {
  if (recent.length < MIN_RECENT_CHUNKS) return null;

  const clippedRatio = recent.reduce((sum, stats) => sum + stats.clippedRatio, 0) / recent.length;
  if (clippedRatio > CLIPPING_RATIO) return 'clipping';

  if (
    sentenceChunks >= NO_SPEECH_MIN_CHUNKS &&
    sentenceSpeechChunks / sentenceChunks < NO_SPEECH_RATIO
  ) {
    return 'no-speech';
  }

  return null;
};

export const trackPcmChunk = (
  tracker: VoiceQualityTracker,
  stats: PcmChunkStats,
): VoiceQualityTracker => {
  const next = {
    ...tracker,
    recent: [...tracker.recent, stats].slice(-RECENT_CHUNKS),
    sentenceChunks: tracker.sentenceChunks + 1,
    sentenceSpeechChunks: tracker.sentenceSpeechChunks + (stats.levelDb >= SPEECH_DB ? 1 : 0),
  };
  const detected = detectVoiceQuality(next);

  if (detected) return { ...next, warning: detected, warningHoldChunks: WARNING_HOLD_CHUNKS };
  if (tracker.warningHoldChunks > 1) {
    return { ...next, warningHoldChunks: tracker.warningHoldChunks - 1 };
  }
  return { ...next, warning: null, warningHoldChunks: 0 };
};

export const startNextSentence = (tracker: VoiceQualityTracker): VoiceQualityTracker => ({
  ...tracker,
  sentenceChunks: 0,
  sentenceSpeechChunks: 0,
});

export const evaluateVoiceQuality = (tracker: VoiceQualityTracker) => tracker.warning;
