'use client';

import { useQuery } from '@tanstack/react-query';
import { getMeetingTranscript } from '../api/get-meeting-transcript';
import { meetingKeys } from './query-keys';
import { normalizeTranscriptSearchKeyword } from './transcript-search-keyword';
import type { MeetingTranscriptSegmentData } from './types';

/**
 * 입력값이 유효한 검색어일 때만 그 검색어와 일치하는 발화를 조회한다.
 * 유효하지 않으면(짧거나 공백만 있으면) 조회하지 않고 빈 배열을 돌려준다.
 */
export const useMeetingTranscriptSearch = (meetingId: number, rawInput: string) => {
  const keyword = normalizeTranscriptSearchKeyword(rawInput);

  const query = useQuery({
    queryKey: meetingKeys.transcriptSearch(meetingId, keyword ?? ''),
    queryFn: () => getMeetingTranscript(meetingId, keyword ?? undefined),
    enabled: keyword !== null,
  });

  const matches: MeetingTranscriptSegmentData[] = keyword !== null ? (query.data ?? []) : [];

  return { keyword, matches, isPending: keyword !== null && query.isPending };
};
