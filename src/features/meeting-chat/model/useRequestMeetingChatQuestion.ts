'use client';

import { useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { requestMeetingChatQuestion } from '../api/request-meeting-chat-question';
import { isRetryableMeetingChatQuestionError, MeetingChatApiError } from './errors';
import type { MeetingChatQuestionRequestData, RequestMeetingChatQuestionParams } from './types';

const MEETING_CHAT_QUESTION_RETRY_COUNT = 2;

interface UseRequestMeetingChatQuestionOptions {
  onSuccess?: (
    data: MeetingChatQuestionRequestData,
    request: RequestMeetingChatQuestionParams,
  ) => void;
  onError?: (
    error: MeetingChatApiError,
    request: RequestMeetingChatQuestionParams,
  ) => void | Promise<void>;
}

export const useRequestMeetingChatQuestion = (
  meetingId: number,
  { onSuccess, onError }: UseRequestMeetingChatQuestionOptions = {},
) => {
  const pendingRequestRef = useRef<RequestMeetingChatQuestionParams | null>(null);
  const isRequestPendingRef = useRef(false);
  const mutation = useMutation<
    MeetingChatQuestionRequestData,
    MeetingChatApiError,
    RequestMeetingChatQuestionParams
  >({
    mutationFn: (request) => requestMeetingChatQuestion(meetingId, request),
    retry: (failureCount, error) =>
      failureCount < MEETING_CHAT_QUESTION_RETRY_COUNT &&
      isRetryableMeetingChatQuestionError(error),
    onSuccess: (data, request) => {
      pendingRequestRef.current = null;
      onSuccess?.(data, request);
    },
    onError: async (error, request) => {
      if (!isRetryableMeetingChatQuestionError(error)) {
        pendingRequestRef.current = null;
      }
      await onError?.(error, request);
    },
    onSettled: () => {
      isRequestPendingRef.current = false;
    },
  });
  const { mutate, reset } = mutation;

  const requestQuestion = useCallback(
    (question: string) => {
      if (isRequestPendingRef.current) return false;

      const normalizedQuestion = question.trim();
      const previousRequest = pendingRequestRef.current;
      const request =
        previousRequest?.question === normalizedQuestion
          ? previousRequest
          : {
              question: normalizedQuestion,
              idempotencyKey: crypto.randomUUID(),
            };

      pendingRequestRef.current = request;
      isRequestPendingRef.current = true;
      mutate(request);
      return true;
    },
    [mutate],
  );

  const resetQuestionRequest = useCallback(() => {
    pendingRequestRef.current = null;
    reset();
  }, [reset]);

  return {
    data: mutation.data,
    error: mutation.error,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    requestQuestion,
    resetQuestionRequest,
  };
};
