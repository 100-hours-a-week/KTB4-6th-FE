'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  meetingChatKeys,
  type MeetingChatApiError,
  type MeetingChatQuestionRequestData,
  useRequestMeetingChatQuestion,
} from '@/features/meeting-chat';
import { useAppToast } from '@/shared/ui';
import type { ChatMessageViewModel } from './meeting-chat-messages';
import { getMeetingChatQuestionErrorFeedback } from './meeting-chat-question-error';

const CHAT_CREDIT_COST = 1;

interface UseMeetingChatComposerOptions {
  meetingId: number;
  serverMessages: ChatMessageViewModel[];
  serverHasAskedQuestion: boolean;
  creditBalance: number | null;
  isUnavailable: boolean;
  onCreditBalanceRefresh: () => Promise<unknown>;
}

export const useMeetingChatComposer = ({
  meetingId,
  serverMessages,
  serverHasAskedQuestion,
  creditBalance,
  isUnavailable,
  onCreditBalanceRefresh,
}: UseMeetingChatComposerOptions) => {
  const queryClient = useQueryClient();
  const { showToast } = useAppToast();
  const [question, setQuestion] = useState('');
  const [hasAskedLocally, setHasAskedLocally] = useState(false);
  const [awaitingMessageId, setAwaitingMessageId] = useState<number | null>(null);
  const [isCreditNoticeOpen, setIsCreditNoticeOpen] = useState(false);
  const hasAskedQuestion = serverHasAskedQuestion || hasAskedLocally;

  const handleQuestionAccepted = useCallback((data: MeetingChatQuestionRequestData) => {
    setQuestion('');
    setHasAskedLocally(true);
    setAwaitingMessageId(data.messageId);
    setIsCreditNoticeOpen(false);
  }, []);
  const handleQuestionError = useCallback(
    async (error: MeetingChatApiError) => {
      const feedback = getMeetingChatQuestionErrorFeedback(error);
      showToast(feedback.message, 'danger');

      if (feedback.recovery === 'credits') {
        await onCreditBalanceRefresh();
      }
      if (feedback.recovery === 'messages') {
        await queryClient.invalidateQueries({ queryKey: meetingChatKeys.list(meetingId) });
      }
    },
    [meetingId, onCreditBalanceRefresh, queryClient, showToast],
  );
  const questionRequest = useRequestMeetingChatQuestion(meetingId, {
    onSuccess: handleQuestionAccepted,
    onError: handleQuestionError,
  });
  const isAwaitingChatEvent =
    awaitingMessageId !== null &&
    !serverMessages.some((message) => message.messageId === awaitingMessageId);
  const isProcessing =
    questionRequest.isPending ||
    isAwaitingChatEvent ||
    serverMessages.some((message) => message.status === 'PROCESSING');

  const sendQuestion = () => {
    const normalizedQuestion = question.trim();
    if (
      isUnavailable ||
      !normalizedQuestion ||
      isProcessing ||
      creditBalance === null ||
      creditBalance < CHAT_CREDIT_COST
    ) {
      return;
    }

    questionRequest.requestQuestion(normalizedQuestion);
  };

  const submitQuestion = () => {
    if (hasAskedQuestion) {
      sendQuestion();
      return;
    }

    setIsCreditNoticeOpen(true);
  };

  const updateQuestion = (nextQuestion: string) => {
    questionRequest.resetQuestionRequest();
    setQuestion(nextQuestion);
  };

  return {
    question,
    setQuestion: updateQuestion,
    creditBalance,
    creditCost: CHAT_CREDIT_COST,
    isProcessing,
    isCreditNoticeOpen,
    setIsCreditNoticeOpen,
    submitQuestion,
    sendQuestion,
  };
};
