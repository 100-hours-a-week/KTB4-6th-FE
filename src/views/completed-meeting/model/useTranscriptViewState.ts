'use client';

import { useMemo } from 'react';
import { PREFETCHED_MEETING_STALE_TIME, useMeetingTranscript } from '@/features/meeting';
import { mapTranscriptSegments } from './map-transcript-segments';

interface UseTranscriptViewStateParams {
  meetingId: number;
}

export const useTranscriptViewState = ({ meetingId }: UseTranscriptViewStateParams) => {
  const transcriptQuery = useMeetingTranscript(meetingId, {
    staleTime: PREFETCHED_MEETING_STALE_TIME,
  });
  const fetchedEntries = useMemo(
    () => (transcriptQuery.data ? mapTranscriptSegments(transcriptQuery.data) : []),
    [transcriptQuery.data],
  );

  const retry = () => void transcriptQuery.refetch();

  if (transcriptQuery.isPending) {
    return { status: 'loading' as const, entries: fetchedEntries, retry };
  }
  if (transcriptQuery.data === undefined) {
    return { status: 'error' as const, entries: fetchedEntries, retry };
  }

  return { status: 'ready' as const, entries: fetchedEntries, retry };
};
