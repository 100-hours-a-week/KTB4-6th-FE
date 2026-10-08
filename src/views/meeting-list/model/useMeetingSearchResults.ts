'use client';

import { useMeetingSearch } from '@/features/meeting-list';
import { toMeetingSearchResults } from './map-meeting-list';
import type { Meeting, MeetingListLoadMoreStatus, MeetingListStatus } from './type';

interface UseMeetingSearchResultsResult {
  status: MeetingListStatus;
  meetings: Meeting[];
  hasMore: boolean;
  loadMoreStatus: MeetingListLoadMoreStatus;
  loadMore: () => void;
}

export const useMeetingSearchResults = (
  teamId: number,
  keyword: string,
): UseMeetingSearchResultsResult => {
  const { status, data, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } =
    useMeetingSearch(teamId, keyword);

  const loadMore = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  };

  if (!data) {
    return {
      status: status === 'error' ? 'error' : 'loading',
      meetings: [],
      hasMore: false,
      loadMoreStatus: 'idle',
      loadMore,
    };
  }

  return {
    status: 'success',
    meetings: toMeetingSearchResults(data.pages),
    hasMore: hasNextPage,
    loadMoreStatus: isFetchingNextPage ? 'loading' : isFetchNextPageError ? 'error' : 'idle',
    loadMore,
  };
};
