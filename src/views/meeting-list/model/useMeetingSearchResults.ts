'use client';

import { useMeetingSearch } from '@/features/meeting-list';
import { toMeetingSearchResults } from './map-meeting-list';
import type { MeetingSearchResultsData } from './type';

export const useMeetingSearchResults = (
  teamId: number,
  keyword: string,
): MeetingSearchResultsData => {
  const {
    status,
    data,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = useMeetingSearch(teamId, keyword);

  const loadMore = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  };

  const retry = () => void refetch();

  if (!data) {
    return {
      keyword,
      status: status === 'error' ? 'error' : 'loading',
      meetings: [],
      hasMore: false,
      loadMoreStatus: 'idle',
      loadMore,
      retry,
    };
  }

  return {
    keyword,
    status: 'success',
    meetings: toMeetingSearchResults(data.pages),
    hasMore: hasNextPage,
    loadMoreStatus: isFetchingNextPage ? 'loading' : isFetchNextPageError ? 'error' : 'idle',
    loadMore,
    retry,
  };
};
