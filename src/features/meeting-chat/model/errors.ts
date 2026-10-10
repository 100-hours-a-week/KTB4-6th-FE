import axios from 'axios';
import type { MeetingChatListErrorCode } from './types';

export class MeetingChatApiError extends Error {
  constructor(
    readonly code: MeetingChatListErrorCode | 'UNKNOWN_ERROR',
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
      error?: { code: MeetingChatListErrorCode; message: string };
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
