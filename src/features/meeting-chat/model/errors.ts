import axios from 'axios';
import type { MeetingChatErrorCode } from './types';

export class MeetingChatApiError extends Error {
  constructor(
    readonly code: MeetingChatErrorCode | 'UNKNOWN_ERROR',
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'MeetingChatApiError';
  }
}

export const toMeetingChatApiError = (
  error: unknown,
  fallbackMessage: string,
): MeetingChatApiError => {
  if (error instanceof MeetingChatApiError) return error;

  if (
    axios.isAxiosError<{
      error?: { code: MeetingChatErrorCode; message: string };
    }>(error)
  ) {
    const apiError = error.response?.data?.error;

    if (apiError) {
      return new MeetingChatApiError(
        apiError.code,
        apiError.message || fallbackMessage,
        error.response?.status,
      );
    }
  }

  return new MeetingChatApiError('UNKNOWN_ERROR', fallbackMessage);
};

export const isRetryableMeetingChatQuestionError = (error: unknown) =>
  error instanceof MeetingChatApiError && (error.status === undefined || error.status >= 500);
