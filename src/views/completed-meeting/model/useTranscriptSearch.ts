'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMeetingTranscriptSearch } from '@/features/meeting';
import type { TranscriptEntry } from './types';

interface UseTranscriptSearchParams {
  meetingId: number;
  entries: TranscriptEntry[];
}

export const useTranscriptSearch = ({ meetingId, entries }: UseTranscriptSearchParams) => {
  const [searchInput, setSearchInput] = useState('');
  const [submittedInput, setSubmittedInput] = useState('');
  const [matchIndex, setMatchIndex] = useState(0);
  const [previousKeyword, setPreviousKeyword] = useState<string | null>(null);

  const { keyword, matches } = useMeetingTranscriptSearch(meetingId, submittedInput);

  const submitSearch = () => setSubmittedInput(searchInput);

  const clearSearch = () => {
    setSearchInput('');
    setSubmittedInput('');
  };

  const matchIds = useMemo(() => {
    if (!keyword) return [];

    const matchedSegmentIds = new Set(matches.map((segment) => String(segment.segmentId)));
    return entries.filter((entry) => matchedSegmentIds.has(entry.id)).map((entry) => entry.id);
  }, [keyword, entries, matches]);

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
    submitSearch,
    clearSearch,
    keyword,
    currentMatchId,
    matchCount: matchIds.length,
    matchPosition: matchIds.length > 0 ? matchIndex + 1 : 0,
    goToNextMatch,
  };
};
