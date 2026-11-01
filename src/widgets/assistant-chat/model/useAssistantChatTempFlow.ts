'use client';

import { useEffect, useRef, useState } from 'react';
import { getTempAnswer } from './temp-answers';
import type { AssistantChatMessage } from './types';

const FIRST_TOKEN_DELAY_MS = 900;
const STREAM_INTERVAL_MS = 40;
const STREAM_CHUNK_LENGTH = 3;

export const useAssistantChatTempFlow = () => {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const nextIdRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnswering = messages.some((message) => message.status === 'streaming');

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const createId = () => String((nextIdRef.current += 1));

  const streamAnswer = (messageId: string, answer: string, length: number) => {
    const nextLength = Math.min(answer.length, length + STREAM_CHUNK_LENGTH);
    const isDone = nextLength === answer.length;

    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? {
              ...message,
              text: answer.slice(0, nextLength),
              status: isDone ? 'completed' : 'streaming',
            }
          : message,
      ),
    );

    if (!isDone) {
      timerRef.current = setTimeout(
        () => streamAnswer(messageId, answer, nextLength),
        STREAM_INTERVAL_MS,
      );
    }
  };

  const send = (question: string) => {
    if (isAnswering) return;

    const answerId = createId();
    setMessages((prev) => [
      ...prev,
      { id: createId(), role: 'user', text: question, status: 'completed' },
      { id: answerId, role: 'assistant', text: '', status: 'streaming' },
    ]);
    timerRef.current = setTimeout(
      () => streamAnswer(answerId, getTempAnswer(question), 0),
      FIRST_TOKEN_DELAY_MS,
    );
  };

  return { messages, isAnswering, send };
};
