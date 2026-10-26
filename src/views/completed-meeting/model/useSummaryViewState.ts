'use client';

import { getMeetingSummaryPhase, useMeetingSummary } from '@/features/meeting';

export type SummaryViewState =
  | { kind: 'loading' }
  | { kind: 'generating' }
  | { kind: 'failed'; isTranscriptEmpty: boolean }
  | { kind: 'error' }
  | { kind: 'completed'; content: string };

interface UseSummaryViewStateParams {
  meetingId: number;
}

export const useSummaryViewState = ({ meetingId }: UseSummaryViewStateParams) => {
  const summaryQuery = useMeetingSummary(meetingId);

  const getState = (): SummaryViewState => {
    if (summaryQuery.isPending) return { kind: 'loading' };
    if (summaryQuery.data === undefined) return { kind: 'error' };

    const phase = getMeetingSummaryPhase(summaryQuery.data);
    if (phase === 'failed') {
      return {
        kind: 'failed',
        isTranscriptEmpty: summaryQuery.data?.failureReason === 'TRANSCRIPT_EMPTY',
      };
    }
    if (phase === 'generating') {
      return summaryQuery.isPollingTimedOut
        ? { kind: 'failed', isTranscriptEmpty: false }
        : { kind: 'generating' };
    }

    return { kind: 'completed', content: summaryQuery.data?.content ?? '' };
  };

  return {
    state: getState(),
    retry: () => void summaryQuery.refetch(),
  };
};
