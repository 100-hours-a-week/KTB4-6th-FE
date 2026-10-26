'use client';

import { useMemo } from 'react';
import { PREFETCHED_MEETING_STALE_TIME, useMeetingTranscript } from '@/features/meeting';
import { mapTranscriptSegments } from './map-transcript-segments';

interface UseTranscriptViewStateParams {
  meetingId: number;
}

/** 전사 탭이 보여줄 전사 항목을 전사 조회 결과로 정한다. */
export const useTranscriptViewState = ({ meetingId }: UseTranscriptViewStateParams) => {
  const transcriptQuery = useMeetingTranscript(meetingId, {
    staleTime: PREFETCHED_MEETING_STALE_TIME,
  });
  // 조회 결과가 바뀔 때만 다시 변환해서, 전사 항목이 같은 값이면 같은 객체로 유지한다.
  const fetchedEntries = useMemo(
    () => (transcriptQuery.data ? mapTranscriptSegments(transcriptQuery.data) : []),
    [transcriptQuery.data],
  );

  const retry = () => void transcriptQuery.refetch();

  if (transcriptQuery.isPending) {
    return { status: 'loading' as const, entries: fetchedEntries, retry };
  }
  // 한 번이라도 조회에 성공했다면 이후의 일시적인 오류는 무시한다.
  if (transcriptQuery.data === undefined) {
    return { status: 'error' as const, entries: fetchedEntries, retry };
  }

  return { status: 'ready' as const, entries: fetchedEntries, retry };
};
