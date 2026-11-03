'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getAssistantChatEvents } from '../api/get-assistant-chat-events';
import { getAssistantChatTurn } from '../api/get-assistant-chat-turn';
import { postAssistantChatQuestion } from '../api/post-assistant-chat-question';
import { AssistantChatApiError, toAssistantChatApiError } from './errors';
import { assistantChatKeys } from './query-keys';
import type {
  AssistantChatQuestionState,
  AssistantChatQuestionStatus,
  AssistantChatStream,
  AssistantChatStreamEvent,
  AssistantChatTurnData,
} from './types';

const MAX_RECONNECT_COUNT = 2;
const ASSISTANT_CHAT_DISCONNECTED_MESSAGE = '답변 연결이 끊겼습니다.';
const ASSISTANT_CHAT_ANSWER_ERROR_MESSAGE = '답변을 받지 못했습니다.';

type OpenStream = (signal: AbortSignal) => Promise<AssistantChatStream>;
type UpdateQuestion = (
  updater: (prev: AssistantChatQuestionState) => AssistantChatQuestionState,
) => void;

const createQuestionState = (
  question: string,
  requestId: number | null,
  status: AssistantChatQuestionStatus,
): AssistantChatQuestionState => ({
  requestId,
  question,
  status,
  phase: null,
  answer: '',
  referencedMeetingIds: [],
  meetingDraft: null,
  failureCode: null,
  error: null,
});

const applyEvent = (
  prev: AssistantChatQuestionState,
  event: AssistantChatStreamEvent,
): AssistantChatQuestionState => {
  switch (event.type) {
    case 'status':
      return { ...prev, requestId: event.aiRequestId, status: 'streaming' };
    case 'phase':
      return { ...prev, phase: event.phase, status: 'streaming' };
    case 'delta':
      return { ...prev, answer: prev.answer + event.text, status: 'streaming' };
    case 'completed':
      return {
        ...prev,
        status: 'completed',
        phase: null,
        answer: event.answer,
        referencedMeetingIds: event.referencedMeetingIds,
        meetingDraft: event.meetingDraft,
      };
    case 'failed':
      return { ...prev, status: 'failed', phase: null, failureCode: event.failureCode };
  }
};

const applyFinishedTurn = (
  prev: AssistantChatQuestionState,
  turn: AssistantChatTurnData,
): AssistantChatQuestionState =>
  turn.status === 'COMPLETED'
    ? {
        ...prev,
        status: 'completed',
        phase: null,
        answer: turn.answer ?? '',
        referencedMeetingIds: turn.referencedMeetingIds,
        meetingDraft: turn.meetingDraft,
      }
    : { ...prev, status: 'failed', phase: null, failureCode: turn.failureCode };

const failQuestion = (
  prev: AssistantChatQuestionState,
  error: AssistantChatApiError,
): AssistantChatQuestionState => ({ ...prev, status: 'failed', phase: null, error });

const followQuestion = async (
  openStream: OpenStream,
  signal: AbortSignal,
  update: UpdateQuestion,
) => {
  const readEvents = async (stream: AssistantChatStream, knownRequestId: number | null) => {
    let requestId = stream.requestId ?? knownRequestId;
    update((prev) => ({ ...prev, requestId, status: 'streaming' }));

    try {
      for await (const event of stream.events) {
        if (event.type === 'status') requestId = event.aiRequestId;
        update((prev) => applyEvent(prev, event));

        if (event.type === 'completed' || event.type === 'failed') {
          return { requestId, isFinished: true };
        }
      }
    } catch (error) {
      if (signal.aborted) throw error;
    }

    return { requestId, isFinished: false };
  };

  try {
    let { requestId, isFinished } = await readEvents(await openStream(signal), null);

    for (
      let count = 0;
      !isFinished && requestId !== null && count < MAX_RECONNECT_COUNT;
      count += 1
    ) {
      const turn = await getAssistantChatTurn(requestId, signal);

      if (turn.status === 'COMPLETED' || turn.status === 'FAILED') {
        update((prev) => applyFinishedTurn(prev, turn));
        return;
      }

      ({ requestId, isFinished } = await readEvents(
        await getAssistantChatEvents(requestId, signal),
        requestId,
      ));
    }

    if (!isFinished) {
      update((prev) =>
        failQuestion(
          prev,
          new AssistantChatApiError('UNKNOWN_ERROR', ASSISTANT_CHAT_DISCONNECTED_MESSAGE),
        ),
      );
    }
  } catch (error) {
    if (signal.aborted) return;
    update((prev) =>
      failQuestion(prev, toAssistantChatApiError(error, ASSISTANT_CHAT_ANSWER_ERROR_MESSAGE)),
    );
  }
};

export const useAssistantChatQuestion = (teamId: number) => {
  const queryClient = useQueryClient();
  const [currentQuestion, setCurrentQuestion] = useState<AssistantChatQuestionState | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const startQuestion = useCallback(
    (initialState: AssistantChatQuestionState, openStream: OpenStream) => {
      if (controllerRef.current) return false;

      const controller = new AbortController();
      controllerRef.current = controller;
      setCurrentQuestion(initialState);

      void followQuestion(openStream, controller.signal, (updater) => {
        if (!controller.signal.aborted) setCurrentQuestion((prev) => prev && updater(prev));
      }).finally(() => {
        if (controllerRef.current === controller) controllerRef.current = null;
        if (!controller.signal.aborted) {
          void queryClient.invalidateQueries({ queryKey: assistantChatKeys.turns(teamId) });
        }
      });

      return true;
    },
    [queryClient, teamId],
  );

  const sendQuestion = useCallback(
    (question: string) => {
      const normalizedQuestion = question.trim();
      if (!normalizedQuestion) return false;

      const idempotencyKey = crypto.randomUUID();

      return startQuestion(createQuestionState(normalizedQuestion, null, 'sending'), (signal) =>
        postAssistantChatQuestion({ teamId, question: normalizedQuestion, idempotencyKey }, signal),
      );
    },
    [startQuestion, teamId],
  );

  const resumeQuestion = useCallback(
    (turn: AssistantChatTurnData) =>
      startQuestion(
        {
          ...createQuestionState(turn.question, turn.aiRequestId, 'streaming'),
          answer: turn.answer ?? '',
        },
        (signal) => getAssistantChatEvents(turn.aiRequestId, signal),
      ),
    [startQuestion],
  );

  return {
    currentQuestion,
    isProcessing: currentQuestion?.status === 'sending' || currentQuestion?.status === 'streaming',
    sendQuestion,
    resumeQuestion,
  };
};
