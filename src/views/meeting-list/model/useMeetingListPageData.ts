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
  /** 오늘 회의가 없으면 null */
  today: TodayMeetings | null;
  groups: MeetingDateGroup[];

  hasMore: boolean;

  loadMoreStatus: MeetingListLoadMoreStatus;
  loadMore: () => void;
}

const noop = () => {};

// en-CA는 날짜를 `YYYY-MM-DD`로 표시한다.
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

  // 두 조회가 모두 도착해야 그린다. 이미 받은 데이터가 있으면 다시 불러오다 실패해도 화면은 그대로 둔다.
  if (!data || !todayQuery.data) {
    const isError =
      (!data && status === 'error') || (!todayQuery.data && todayQuery.status === 'error');

    return {
      status: isError ? 'error' : 'loading',
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

  // 이미 불러오는 중에 다시 요청하면 진행 중인 요청이 취소될 수 있어 막는다.
  const loadMore = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  };

  return {
    status: 'success',
    today: toTodayMeetings(todayQuery.data, today),
    groups: toMeetingDateGroups(data.pages, today),
    hasMore: hasNextPage,
    loadMoreStatus,
    loadMore,
  };
};
