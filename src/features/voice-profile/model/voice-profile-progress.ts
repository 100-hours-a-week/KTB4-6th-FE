import { PCM_SAMPLE_RATE } from '@/shared/lib';
import { getMinSentenceSamples, VOICE_PROFILE_SCRIPT } from './voice-profile-script';

export interface VoiceProfileProgress {
  sentenceIndex: number;
  recordedCount: number;
  sentenceSamples: number;
  totalSamples: number;
}

export type NextSentenceStep = 'blocked' | 'view' | 'record' | 'finish';

const LAST_SENTENCE_INDEX = VOICE_PROFILE_SCRIPT.length - 1;

export const INITIAL_VOICE_PROFILE_PROGRESS: VoiceProfileProgress = {
  sentenceIndex: 0,
  recordedCount: 0,
  sentenceSamples: 0,
  totalSamples: 0,
};

export const addRecordedSamples = (
  progress: VoiceProfileProgress,
  samples: number,
): VoiceProfileProgress => ({
  ...progress,
  sentenceSamples: progress.sentenceSamples + samples,
  totalSamples: progress.totalSamples + samples,
});

export const getNextSentenceStep = ({
  sentenceIndex,
  recordedCount,
  sentenceSamples,
}: VoiceProfileProgress): NextSentenceStep => {
  if (sentenceIndex < recordedCount) return 'view';
  if (sentenceSamples < getMinSentenceSamples(sentenceIndex)) return 'blocked';
  return sentenceIndex === LAST_SENTENCE_INDEX ? 'finish' : 'record';
};

export const viewNextSentence = (progress: VoiceProfileProgress): VoiceProfileProgress => ({
  ...progress,
  sentenceIndex: progress.sentenceIndex + 1,
});

export const recordNextSentence = (progress: VoiceProfileProgress): VoiceProfileProgress => ({
  ...progress,
  sentenceIndex: progress.sentenceIndex + 1,
  recordedCount: progress.recordedCount + 1,
  sentenceSamples: 0,
});

export const viewPreviousSentence = (progress: VoiceProfileProgress): VoiceProfileProgress => ({
  ...progress,
  sentenceIndex: Math.max(0, progress.sentenceIndex - 1),
});

export const completeAllSentences = (progress: VoiceProfileProgress): VoiceProfileProgress => ({
  ...progress,
  recordedCount: VOICE_PROFILE_SCRIPT.length,
});

export const getRecordedSentences = ({ recordedCount }: VoiceProfileProgress) =>
  VOICE_PROFILE_SCRIPT.map((_, index) => index < recordedCount);

export const getSentenceProgress = ({ recordedCount, sentenceSamples }: VoiceProfileProgress) =>
  recordedCount < VOICE_PROFILE_SCRIPT.length
    ? sentenceSamples / getMinSentenceSamples(recordedCount)
    : 1;

export const getElapsedSeconds = ({ totalSamples }: VoiceProfileProgress) =>
  Math.floor(totalSamples / PCM_SAMPLE_RATE);
