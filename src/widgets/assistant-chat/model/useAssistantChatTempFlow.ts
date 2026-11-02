'use client';

import { useEffect, useRef, useState } from 'react';
import { getTempReply, TEMP_CREATED_MEETING_ID, TEMP_MEETING_CREATED_ANSWER } from './temp-answers';
import type { AssistantChatHistoryStatus, AssistantChatMessage } from './types';

const HISTORY_LOAD_DELAY_MS = 700;
const FIRST_TOKEN_DELAY_MS = 900;
const PHASE_DURATION_MS = 1200;
const STREAM_INTERVAL_MS = 40;
const STREAM_CHUNK_LENGTH = 3;
const MEETING_CREATE_DELAY_MS = 900;
const MEETING_CREATED_ANSWER_DELAY_MS = 600;

type MessagePatch = Partial<Omit<AssistantChatMessage, 'id' | 'role'>>;

export const useAssistantChatTempFlow = () => {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [historyStatus, setHistoryStatus] = useState<AssistantChatHistoryStatus>('loading');
  const nextIdRef = useRef(0);
  const timersRef = useRef(new Set<ReturnType<typeof setTimeout>>());
  const isAwaitingMeetingDetailsRef = useRef(false);
  const failingDraftIdsRef = useRef(new Set<string>());
  const resentQuestionsRef = useRef(new Set<string>());
  const isAnswering = messages.some((message) => message.status === 'streaming');

  useEffect(() => {
    const timers = timersRef.current;
    const timer = setTimeout(() => setHistoryStatus('ready'), HISTORY_LOAD_DELAY_MS);

    return () => {
      clearTimeout(timer);
      timers.forEach(clearTimeout);
    };
  }, []);

  const schedule = (callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);
    timersRef.current.add(timer);
  };

  const createId = () => String((nextIdRef.current += 1));

  const updateMessage = (messageId: string, patch: MessagePatch) => {
    setMessages((prev) =>
      prev.map((message) => (message.id === messageId ? { ...message, ...patch } : message)),
    );
  };

  const streamText = (
    messageId: string,
    text: string,
    completedPatch: MessagePatch = {},
    length = 0,
  ) => {
    const nextLength = Math.min(text.length, length + STREAM_CHUNK_LENGTH);
    const isDone = nextLength === text.length;

    updateMessage(messageId, {
      text: text.slice(0, nextLength),
      status: isDone ? 'completed' : 'streaming',
      ...(isDone ? completedPatch : {}),
    });

    if (!isDone) {
      schedule(() => streamText(messageId, text, completedPatch, nextLength), STREAM_INTERVAL_MS);
    }
  };

  const reply = (answerId: string, question: string) => {
    const tempQuestion = resentQuestionsRef.current.delete(question)
      ? question.replace(/답변\s*실패/, '')
      : question;
    const tempReply = getTempReply(tempQuestion, isAwaitingMeetingDetailsRef.current);
    const phases = 'phases' in tempReply ? tempReply.phases : [];

    phases.forEach((phase, index) => {
      schedule(() => updateMessage(answerId, { phase }), index * PHASE_DURATION_MS);
    });

    schedule(
      () => {
        if (tempReply.kind === 'answerFailure' || tempReply.kind === 'historyFailure') {
          updateMessage(answerId, { status: 'failed' });
          return;
        }

        if (tempReply.kind === 'meetingDraft') {
          isAwaitingMeetingDetailsRef.current = false;
          if (tempReply.willFail) failingDraftIdsRef.current.add(answerId);
          setMessages((prev) =>
            prev.map((message) =>
              message.meetingDraftStatus === 'pending' || message.meetingDraftStatus === 'failed'
                ? { ...message, meetingDraftStatus: 'expired' }
                : message,
            ),
          );
          streamText(answerId, tempReply.text, {
            meetingDraft: tempReply.meetingDraft,
            meetingDraftStatus: 'pending',
          });
          return;
        }

        isAwaitingMeetingDetailsRef.current = tempReply.asksMeetingDetails;
        streamText(answerId, tempReply.text, { referencedMeetings: tempReply.referencedMeetings });
      },
      FIRST_TOKEN_DELAY_MS + phases.length * PHASE_DURATION_MS,
    );
  };

  const send = (question: string) => {
    if (isAnswering || historyStatus !== 'ready') return;

    if (getTempReply(question, false).kind === 'historyFailure') {
      setHistoryStatus('error');
      return;
    }

    const answerId = createId();
    setMessages((prev) => [
      ...prev,
      { id: createId(), role: 'user', text: question, status: 'completed' },
      { id: answerId, role: 'assistant', text: '', status: 'streaming' },
    ]);
    reply(answerId, question);
  };

  const resendQuestion = (answerId: string) => {
    const answerIndex = messages.findIndex((message) => message.id === answerId);
    const question = messages
      .slice(0, answerIndex)
      .findLast((message) => message.role === 'user')?.text;
    if (!question) return;

    resentQuestionsRef.current.add(question);
    send(question);
  };

  const cancelMeetingDraft = (messageId: string) => {
    updateMessage(messageId, { meetingDraftStatus: 'cancelled' });
  };

  const confirmMeetingDraft = (messageId: string) => {
    if (isAnswering) return;

    updateMessage(messageId, { meetingDraftStatus: 'sending' });
    schedule(() => {
      if (failingDraftIdsRef.current.delete(messageId)) {
        updateMessage(messageId, { meetingDraftStatus: 'failed' });
        return;
      }

      const answerId = createId();
      updateMessage(messageId, { meetingDraftStatus: 'confirmed' });
      setMessages((prev) => [
        ...prev,
        { id: answerId, role: 'assistant', text: '', status: 'streaming' },
      ]);
      schedule(
        () =>
          streamText(answerId, TEMP_MEETING_CREATED_ANSWER, {
            createdMeetingId: TEMP_CREATED_MEETING_ID,
          }),
        MEETING_CREATED_ANSWER_DELAY_MS,
      );
    }, MEETING_CREATE_DELAY_MS);
  };

  const reloadHistory = () => {
    setHistoryStatus('loading');
    schedule(() => setHistoryStatus('ready'), HISTORY_LOAD_DELAY_MS);
  };

  return {
    messages,
    historyStatus,
    isAnswering,
    send,
    resendQuestion,
    confirmMeetingDraft,
    cancelMeetingDraft,
    reloadHistory,
  };
};
