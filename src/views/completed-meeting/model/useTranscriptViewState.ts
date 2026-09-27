'use client';

import { useMemo } from 'react';
import { useMeetingTranscript } from '@/features/meeting';
import { mapTranscriptSegments } from './map-transcript-segments';
import type { TranscriptEntry } from './preview-meeting-transcript';

interface UseTranscriptViewStateParams {
  meetingId: number;
  /** 개발 환경 전용 미리보기 전사. 있으면 조회하지 않고 이 목데이터를 쓴다. */
  previewEntries?: TranscriptEntry[];
}

/** 전사 탭이 보여줄 전사 항목을 전사 조회 결과(또는 개발용 미리보기)로 정한다. */
export const useTranscriptViewState = ({
  meetingId,
  previewEntries,
}: UseTranscriptViewStateParams) => {
  const transcriptQuery = useMeetingTranscript(meetingId, {
    isEnabled: previewEntries === undefined,
  });
  // 조회 결과가 바뀔 때만 다시 변환해서, 전사 항목이 같은 값이면 같은 객체로 유지한다.
  const fetchedEntries = useMemo(
    () => (transcriptQuery.data ? mapTranscriptSegments(transcriptQuery.data) : []),
    [transcriptQuery.data],
  );

  const retry = () => void transcriptQuery.refetch();

  if (previewEntries) return { status: 'ready' as const, entries: previewEntries, retry };
  if (transcriptQuery.isPending) {
    return { status: 'loading' as const, entries: fetchedEntries, retry };
  }
  // 한 번이라도 조회에 성공했다면 이후의 일시적인 오류는 무시한다.
  if (transcriptQuery.data === undefined) {
    return { status: 'error' as const, entries: fetchedEntries, retry };
  }

  return { status: 'ready' as const, entries: fetchedEntries, retry };
};
