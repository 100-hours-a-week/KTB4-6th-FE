'use client';

import { useState } from 'react';
import type { ChatMessageViewModel } from './meeting-chat-messages';
import { formatChatMessageTime } from './meeting-chat-messages';
import { mockChatComposer } from './mock-chat-composer';

const CHAT_CREDIT_COST = 1;

interface UseMeetingChatComposerOptions {
  serverMessages: ChatMessageViewModel[];
  serverHasAskedQuestion: boolean;
  isUnavailable: boolean;
}

export const useMeetingChatComposer = ({
  serverMessages,
  serverHasAskedQuestion,
  isUnavailable,
}: UseMeetingChatComposerOptions) => {
  const [localMessages, setLocalMessages] = useState<ChatMessageViewModel[]>([]);
  const [question, setQuestion] = useState('');
  const [creditBalance, setCreditBalance] = useState(mockChatComposer.creditBalance);
  const [hasAskedLocally, setHasAskedLocally] = useState(false);
  const [isCreditNoticeOpen, setIsCreditNoticeOpen] = useState(false);
  const messages = [...serverMessages, ...localMessages];
  const hasAskedQuestion = serverHasAskedQuestion || hasAskedLocally;
  const isProcessing = messages.some((message) => message.status === 'PROCESSING');

  const sendQuestion = () => {
    const normalizedQuestion = question.trim();
    if (isUnavailable || !normalizedQuestion || isProcessing || creditBalance < CHAT_CREDIT_COST) {
      return;
    }

    const message: ChatMessageViewModel = {
      id: `local-chat-message-${Date.now()}`,
      messageId: null,
      askerTeamMemberId: null,
      askerDisplayName: mockChatComposer.currentUserDisplayName,
      createdAtLabel: formatChatMessageTime(new Date()),
      question: normalizedQuestion,
      status: 'PROCESSING',
      answer: null,
      citations: null,
    };

    setLocalMessages((currentMessages) => [...currentMessages, message]);
    setCreditBalance((currentCredit) => currentCredit - CHAT_CREDIT_COST);
    setQuestion('');
    setHasAskedLocally(true);
    setIsCreditNoticeOpen(false);
  };

  const submitQuestion = () => {
    if (hasAskedQuestion) {
      sendQuestion();
      return;
    }

    setIsCreditNoticeOpen(true);
  };

  return {
    messages,
    question,
    setQuestion,
    creditBalance,
    creditCost: CHAT_CREDIT_COST,
    isProcessing,
    isCreditNoticeOpen,
    setIsCreditNoticeOpen,
    submitQuestion,
    sendQuestion,
  };
};
