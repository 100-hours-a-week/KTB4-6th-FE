'use client';

import { getMeetingSummaryPhase, useMeetingSummary } from '@/features/meeting';
import type { MeetingSummaryStatus } from './preview-completed-meeting';
import { mockMeetingSummaryMarkdown } from './preview-meeting-summary';

export type SummaryViewState =
  | { kind: 'loading' }
  | { kind: 'generating' }
  | { kind: 'failed'; isTranscriptEmpty: boolean }
  | { kind: 'error' }
  | { kind: 'completed'; content: string };

interface UseSummaryViewStateParams {
  meetingId: number;
  previewStatus?: MeetingSummaryStatus;
}

export const useSummaryViewState = ({ meetingId, previewStatus }: UseSummaryViewStateParams) => {
  const summaryQuery = useMeetingSummary(meetingId, { isEnabled: previewStatus === undefined });

  const getState = (): SummaryViewState => {
    if (previewStatus) {
      return previewStatus === 'completed'
        ? { kind: 'completed', content: mockMeetingSummaryMarkdown }
        : previewStatus === 'failed'
          ? { kind: 'failed', isTranscriptEmpty: false }
          : { kind: previewStatus };
    }
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
