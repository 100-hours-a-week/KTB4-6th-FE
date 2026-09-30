'use client';

import { useMeetingList } from '@/features/meeting-list';
import { toMeetings } from './map-meeting-list';
import type { Meeting, MeetingListLoadMoreStatus, MeetingListStatus } from './type';

interface UseMeetingListPageDataResult {
  status: MeetingListStatus;
  meetings: Meeting[];

  hasMore: boolean;

  loadMoreStatus: MeetingListLoadMoreStatus;
  loadMore: () => void;
}

const noop = () => {};

export const useMeetingListPageData = (teamId: number): UseMeetingListPageDataResult => {
  const { status, data, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } =
    useMeetingList(teamId);

  if (!data) {
    return {
      status: status === 'error' ? 'error' : 'loading',
      meetings: [],
      hasMore: false,
      loadMoreStatus: 'idle',
      loadMore: noop,
    };
  }

  const loadMoreStatus: MeetingListLoadMoreStatus = isFetchingNextPage
    ? 'loading'
    : isFetchNextPageError
      ? 'error'
      : 'idle';

  // 이미 불러오는 중에 다시 요청하면 진행 중인 요청이 취소될 수 있어 막는다.
  const loadMore = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  };

  return {
    status: 'success',
    meetings: toMeetings(data.pages),
    hasMore: hasNextPage,
    loadMoreStatus,
    loadMore,
  };
};
