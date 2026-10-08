'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getMeetingList } from '../api/get-meeting-list';
import { meetingListKeys } from './query-keys';

export const useMeetingSearch = (teamId: number, keyword: string) =>
  useInfiniteQuery({
    queryKey: meetingListKeys.search(teamId, keyword),
    queryFn: ({ pageParam }) => getMeetingList(teamId, { keyword, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
    enabled: keyword !== '',
  });
