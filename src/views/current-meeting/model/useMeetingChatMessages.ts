'use client';

import { useMemo } from 'react';
import { useMeetingChatList } from '@/features/meeting-chat';
import { mergeMeetingChatPages } from './meeting-chat-messages';

export const useMeetingChatMessages = (meetingId: number) => {
  const { data, isPending, isError, isFetching, refetch } = useMeetingChatList(meetingId);
  const messages = useMemo(() => mergeMeetingChatPages(data?.pages ?? []), [data?.pages]);

  return {
    messages,
    hasAskedQuestion: data?.pages[0]?.hasAskedQuestion ?? false,
    isLoading: isPending,
    isError: isError && !data,
    isRetrying: isFetching,
    retry: () => void refetch(),
  };
};
