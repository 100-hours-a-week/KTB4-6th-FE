'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getMeetingChatList } from '../api/get-meeting-chat-list';
import { meetingChatKeys } from './query-keys';

export const useMeetingChatList = (meetingId: number) =>
  useInfiniteQuery({
    queryKey: meetingChatKeys.list(meetingId),
    queryFn: ({ pageParam, signal }) => getMeetingChatList(meetingId, pageParam, signal),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.nextCursor !== null ? lastPage.nextCursor : undefined,
    enabled: Number.isSafeInteger(meetingId) && meetingId > 0,
    refetchOnMount: 'always',
  });
