'use client';

import { useEffect, useMemo } from 'react';
import {
  type AssistantChatRequestStatus,
  useAssistantChatQuestion,
  useAssistantChatTurns,
} from '@/features/assistant-chat';
import { toAssistantChatMessages } from './to-assistant-chat-messages';
import { useAssistantChatMeetingDraftConfirm } from './useAssistantChatMeetingDraftConfirm';
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
  const { draftResults, confirmMeetingDraft } = useAssistantChatMeetingDraftConfirm(teamId);
  const turns = useMemo(
    () =>
      (data?.pages ?? [])
        .flatMap((page) => page.messages)
        .toSorted((a, b) => a.messageId - b.messageId),
    [data],
  );
  const latestTurn = turns.at(-1);
  const messages = useMemo(
    () => toAssistantChatMessages(turns, currentQuestion, draftResults),
    [turns, currentQuestion, draftResults],
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

  const confirmDraft = (messageId: string) => {
    const message = messages.find((item) => item.id === messageId);
    if (message?.requestId === undefined || !message.meetingDraft) return;
    confirmMeetingDraft(message.requestId, message.meetingDraft);
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
    confirmMeetingDraft: confirmDraft,
    reloadHistory: () => void refetch(),
    loadOlderMessages,
  };
};
