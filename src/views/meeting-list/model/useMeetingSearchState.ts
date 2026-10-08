'use client';

import { useState } from 'react';
import { useAppToast } from '@/shared/ui';

export const MEETING_SEARCH_MAX_LENGTH = 20;

export const useMeetingSearchState = () => {
  const { showToast } = useAppToast();
  const [query, setQueryState] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');

  const setQuery = (value: string) => setQueryState(value.slice(0, MEETING_SEARCH_MAX_LENGTH));

  const submit = () => {
    const keyword = query.trim();
    if (!keyword) {
      showToast('검색어를 입력해주세요', 'info');
      return;
    }
    setSubmittedKeyword(keyword);
  };

  const cancel = () => {
    setQueryState('');
    setSubmittedKeyword('');
  };

  return {
    query,
    submittedKeyword,
    isSearching: submittedKeyword !== '',
    setQuery,
    clearQuery: () => setQueryState(''),
    submit,
    cancel,
  };
};
