'use client';

import { useCallback, useState } from 'react';
import {
  type MeetingChatQuestionRequestData,
  useRequestMeetingChatQuestion,
} from '@/features/meeting-chat';
import type { ChatMessageViewModel } from './meeting-chat-messages';

const CHAT_CREDIT_COST = 1;

interface UseMeetingChatComposerOptions {
  meetingId: number;
  serverMessages: ChatMessageViewModel[];
  serverHasAskedQuestion: boolean;
  creditBalance: number | null;
  isUnavailable: boolean;
  onCreditBalanceChange: (creditBalance: number) => void;
}

export const useMeetingChatComposer = ({
  meetingId,
  serverMessages,
  serverHasAskedQuestion,
  creditBalance,
  isUnavailable,
  onCreditBalanceChange,
}: UseMeetingChatComposerOptions) => {
  const [question, setQuestion] = useState('');
  const [hasAskedLocally, setHasAskedLocally] = useState(false);
  const [awaitingMessageId, setAwaitingMessageId] = useState<number | null>(null);
  const [isCreditNoticeOpen, setIsCreditNoticeOpen] = useState(false);
  const hasAskedQuestion = serverHasAskedQuestion || hasAskedLocally;

  const handleQuestionAccepted = useCallback(
    (data: MeetingChatQuestionRequestData) => {
      onCreditBalanceChange(data.creditBalance);
      setQuestion('');
      setHasAskedLocally(true);
      setAwaitingMessageId(data.messageId);
      setIsCreditNoticeOpen(false);
    },
    [onCreditBalanceChange],
  );
  const questionRequest = useRequestMeetingChatQuestion(meetingId, {
    onSuccess: handleQuestionAccepted,
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
