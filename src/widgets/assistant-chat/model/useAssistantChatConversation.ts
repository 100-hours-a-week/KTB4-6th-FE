'use client';

import { useEffect, useMemo } from 'react';
import {
  type AssistantChatRequestStatus,
  useAssistantChatQuestion,
  useAssistantChatTurns,
} from '@/features/assistant-chat';
import { toAssistantChatMessages } from './to-assistant-chat-messages';
import type { AssistantChatHistoryStatus } from './types';

const IN_PROGRESS_STATUSES: ReadonlySet<AssistantChatRequestStatus> = new Set([
  'ACCEPTED',
  'PROCESSING',
]);

export const useAssistantChatConversation = (teamId: number) => {
  const { data, isError, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    useAssistantChatTurns(teamId);
  const { currentQuestion, isProcessing, sendQuestion, resumeQuestion } =
    useAssistantChatQuestion(teamId);
  const turns = useMemo(
    () =>
      (data?.pages ?? [])
        .flatMap((page) => page.messages)
        .toSorted((a, b) => a.messageId - b.messageId),
    [data],
  );
  const latestTurn = turns.at(-1);
  const messages = useMemo(
    () => toAssistantChatMessages(turns, currentQuestion),
    [turns, currentQuestion],
  );
  const historyStatus: AssistantChatHistoryStatus = data
    ? 'ready'
    : isError && !isFetching
      ? 'error'
      : 'loading';

  useEffect(() => {
    if (currentQuestion || !latestTurn || !IN_PROGRESS_STATUSES.has(latestTurn.status)) return;
    resumeQuestion(latestTurn);
  }, [currentQuestion, latestTurn, resumeQuestion]);

  const send = (question: string) => {
    if (historyStatus !== 'ready') return;
    sendQuestion(question);
  };

  const resendQuestion = (answerId: string) => {
    const answerIndex = messages.findIndex((message) => message.id === answerId);
    const question = messages
      .slice(0, answerIndex)
      .findLast((message) => message.role === 'user')?.text;
    if (question) send(question);
  };

  const loadOlderMessages = () => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  };

  return {
    messages,
    historyStatus,
    isAnswering: isProcessing,
    isLoadingOlderMessages: isFetchingNextPage,
    send,
    resendQuestion,
    reloadHistory: () => void refetch(),
    loadOlderMessages,
  };
};
