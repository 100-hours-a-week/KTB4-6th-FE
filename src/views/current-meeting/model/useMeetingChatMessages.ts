'use client';

import { useCallback, useMemo } from 'react';
import { useMeetingChatList } from '@/features/meeting-chat';
import { mergeMeetingChatPages } from './meeting-chat-messages';

export const useMeetingChatMessages = (meetingId: number) => {
  const {
    data,
    isPending,
    isError,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    refetch,
  } = useMeetingChatList(meetingId);
  const messages = useMemo(() => mergeMeetingChatPages(data?.pages ?? []), [data?.pages]);
  const loadOlderMessages = useCallback(async () => {
    await fetchNextPage();
  }, [fetchNextPage]);

  return {
    messages,
    hasAskedQuestion: data?.pages[0]?.hasAskedQuestion ?? false,
    isLoading: isPending,
    isError: isError && !data,
    isRetrying: isFetching,
    hasOlderMessages: hasNextPage ?? false,
    isLoadingOlderMessages: isFetchingNextPage,
    hasLoadingOlderMessagesError: isFetchNextPageError,
    loadOlderMessages,
    retry: () => void refetch(),
  };
};
