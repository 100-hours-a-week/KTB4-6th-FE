'use client';

import { useMeetingList } from '@/features/meeting-list';
import { toMeetingDateGroups } from './map-meeting-list';
import type { MeetingDateGroup, MeetingListLoadMoreStatus, MeetingListStatus } from './type';

interface UseMeetingListPageDataResult {
  status: MeetingListStatus;
  groups: MeetingDateGroup[];

  hasMore: boolean;

  loadMoreStatus: MeetingListLoadMoreStatus;
  loadMore: () => void;
}

const noop = () => {};

const kstYearFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
});

const getKstCurrentYear = () =>
  kstYearFormatter.formatToParts(new Date()).find(({ type }) => type === 'year')?.value ?? '';

export const useMeetingListPageData = (teamId: number): UseMeetingListPageDataResult => {
  const { status, data, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } =
    useMeetingList(teamId);

  if (!data) {
    return {
      status: status === 'error' ? 'error' : 'loading',
      groups: [],
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
    groups: toMeetingDateGroups(data.pages, getKstCurrentYear()),
    hasMore: hasNextPage,
    loadMoreStatus,
    loadMore,
  };
};
