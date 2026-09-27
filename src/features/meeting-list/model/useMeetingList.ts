'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getMeetingList } from '../api/get-meeting-list';
import { meetingListKeys } from './query-keys';

export const useMeetingList = (teamId: number) =>
  useInfiniteQuery({
    queryKey: meetingListKeys.list(teamId),
    queryFn: ({ pageParam }) => getMeetingList(teamId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
  });
