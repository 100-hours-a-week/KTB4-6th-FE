'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMeetingTranscriptSearch } from '@/features/meeting';
import type { TranscriptEntry } from './preview-meeting-transcript';

interface UseTranscriptSearchParams {
  meetingId: number;
  entries: TranscriptEntry[];
}

/**
 * 전사 검색 입력과 결과 순회를 관리한다.
 * 검색 결과는 서버가 알려준 발화 중, 화면에 보이는 전사 순서(entries) 그대로 넘어가게 정렬한다.
 */
export const useTranscriptSearch = ({ meetingId, entries }: UseTranscriptSearchParams) => {
  const [searchInput, setSearchInput] = useState('');
  const [matchIndex, setMatchIndex] = useState(0);
  const [previousKeyword, setPreviousKeyword] = useState<string | null>(null);

  const { keyword, matches } = useMeetingTranscriptSearch(meetingId, searchInput);

  const matchIds = useMemo(() => {
    if (!keyword) return [];

    const matchedSegmentIds = new Set(matches.map((segment) => String(segment.segmentId)));
    return entries.filter((entry) => matchedSegmentIds.has(entry.id)).map((entry) => entry.id);
  }, [keyword, entries, matches]);

  // 검색어가 바뀌면 결과를 처음부터 다시 본다.
  if (keyword !== previousKeyword) {
    setPreviousKeyword(keyword);
    setMatchIndex(0);
  }

  const currentMatchId = matchIds[matchIndex] ?? null;

  useEffect(() => {
    if (!currentMatchId) return;

    const item = document.querySelector<HTMLElement>(
      `[data-tab="transcript"] [data-entry-id="${CSS.escape(currentMatchId)}"]`,
    );
    item?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentMatchId]);

  const goToNextMatch = () => {
    if (matchIds.length === 0) return;
    setMatchIndex((index) => (index + 1) % matchIds.length);
  };

  return {
    searchInput,
    setSearchInput,
    keyword,
    currentMatchId,
    matchCount: matchIds.length,
    matchPosition: matchIds.length > 0 ? matchIndex + 1 : 0,
    goToNextMatch,
  };
};
