'use client';

import { useCallback, useState } from 'react';
import {
  type MeetingChatQuestionRequestData,
  type RequestMeetingChatQuestionParams,
  useRequestMeetingChatQuestion,
} from '@/features/meeting-chat';
import type { ChatMessageViewModel } from './meeting-chat-messages';
import { formatChatMessageTime } from './meeting-chat-messages';
import { mockChatComposer } from './mock-chat-composer';

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
  const [localMessages, setLocalMessages] = useState<ChatMessageViewModel[]>([]);
  const [question, setQuestion] = useState('');
  const [hasAskedLocally, setHasAskedLocally] = useState(false);
  const [isCreditNoticeOpen, setIsCreditNoticeOpen] = useState(false);
  const messages = [...serverMessages, ...localMessages];
  const hasAskedQuestion = serverHasAskedQuestion || hasAskedLocally;

  const handleQuestionAccepted = useCallback(
    (data: MeetingChatQuestionRequestData, request: RequestMeetingChatQuestionParams) => {
      const message: ChatMessageViewModel = {
        id: `chat-message-${data.messageId}`,
        messageId: data.messageId,
        askerTeamMemberId: null,
        askerDisplayName: mockChatComposer.currentUserDisplayName,
        createdAtLabel: formatChatMessageTime(new Date()),
        question: request.question,
        status: 'PROCESSING',
        answer: null,
        citations: null,
      };

      setLocalMessages((currentMessages) => [...currentMessages, message]);
      onCreditBalanceChange(data.creditBalance);
      setQuestion('');
      setHasAskedLocally(true);
      setIsCreditNoticeOpen(false);
    },
    [onCreditBalanceChange],
  );
  const questionRequest = useRequestMeetingChatQuestion(meetingId, {
    onSuccess: handleQuestionAccepted,
  });
  const isProcessing =
    questionRequest.isPending || messages.some((message) => message.status === 'PROCESSING');

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
    messages,
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
