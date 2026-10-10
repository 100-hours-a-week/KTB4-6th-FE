'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getMeetingChatList } from '../api/get-meeting-chat-list';
import { meetingChatKeys } from './query-keys';

export const useMeetingChatList = (meetingId: number) =>
  useInfiniteQuery({
    queryKey: meetingChatKeys.list(meetingId),
    queryFn: ({ pageParam }) => getMeetingChatList(meetingId, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.nextCursor !== null ? lastPage.nextCursor : undefined,
    enabled: Number.isSafeInteger(meetingId) && meetingId > 0,
  });
