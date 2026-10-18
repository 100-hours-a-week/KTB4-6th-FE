'use client';

import { useMeetingList, useTodayMeetings } from '@/features/meeting-list';
import { toMeetingDateGroups, toTodayMeetings } from './map-meeting-list';
import type {
  MeetingDateGroup,
  MeetingListLoadMoreStatus,
  MeetingListStatus,
  TodayMeetings,
} from './type';

interface UseMeetingListPageDataResult {
  status: MeetingListStatus;
  isEmpty: boolean;
  today: TodayMeetings | null;
  groups: MeetingDateGroup[];

  hasMore: boolean;

  loadMoreStatus: MeetingListLoadMoreStatus;
  loadMore: () => void;
}

const noop = () => {};

const kstDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const useMeetingListPageData = (teamId: number): UseMeetingListPageDataResult => {
  const today = kstDateFormatter.format(new Date());
  const { status, data, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } =
    useMeetingList(teamId);
  const todayQuery = useTodayMeetings(teamId, today);

  if (!data || !todayQuery.data) {
    const isError =
      (!data && status === 'error') || (!todayQuery.data && todayQuery.status === 'error');

    return {
      status: isError ? 'error' : 'loading',
      isEmpty: false,
      today: null,
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

  const loadMore = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  };

  const todayMeetings = toTodayMeetings(todayQuery.data, today);
  const groups = toMeetingDateGroups(data.pages, today);

  return {
    status: 'success',
    isEmpty: !todayMeetings && groups.length === 0 && !hasNextPage,
    today: todayMeetings,
    groups,
    hasMore: hasNextPage,
    loadMoreStatus,
    loadMore,
  };
};
