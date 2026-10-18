'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMeetingChatAnswerDeadline, useMeetingChatList } from '@/features/meeting-chat';
import { collectMeetingChatMessages, toChatMessageViewModels } from './meeting-chat-messages';

const useNextAnswerDeadlineTick = (deadlines: number[]) => {
  const [now, setNow] = useState(() => Date.now());
  const nextDeadline = deadlines.filter((deadline) => deadline > now).sort((a, b) => a - b)[0];

  useEffect(() => {
    if (nextDeadline === undefined) return;

    const timeoutId = window.setTimeout(() => setNow(Date.now()), nextDeadline - Date.now());
    return () => window.clearTimeout(timeoutId);
  }, [nextDeadline]);

  return now;
};

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
  const serverMessages = useMemo(
    () => collectMeetingChatMessages(data?.pages ?? []),
    [data?.pages],
  );
  const answerDeadlines = useMemo(
    () =>
      serverMessages
        .map(getMeetingChatAnswerDeadline)
        .filter((deadline): deadline is number => deadline !== null),
    [serverMessages],
  );
  const now = useNextAnswerDeadlineTick(answerDeadlines);
  const messages = useMemo(
    () => toChatMessageViewModels(serverMessages, now),
    [now, serverMessages],
  );
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
