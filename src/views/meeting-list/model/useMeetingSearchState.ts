'use client';

import { useState } from 'react';
import { useAppToast } from '@/shared/ui';

export const MEETING_SEARCH_MAX_LENGTH = 20;

export const useMeetingSearchState = () => {
  const { showToast } = useAppToast();
  const [isOpen, setIsOpen] = useState(false);
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
    setIsOpen(false);
    setQueryState('');
    setSubmittedKeyword('');
  };

  return {
    isOpen,
    query,
    submittedKeyword,
    isSearching: submittedKeyword !== '',
    open: () => setIsOpen(true),
    setQuery,
    clearQuery: () => setQueryState(''),
    submit,
    cancel,
  };
};
