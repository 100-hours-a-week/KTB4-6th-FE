import axios from 'axios';
import type { AssistantChatErrorCode } from './types';

export class AssistantChatApiError extends Error {
  constructor(
    readonly code: AssistantChatErrorCode | 'UNKNOWN_ERROR',
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'AssistantChatApiError';
  }
}

export const toAssistantChatApiError = (
  error: unknown,
  fallbackMessage: string,
): AssistantChatApiError => {
  if (error instanceof AssistantChatApiError) return error;

  if (
    axios.isAxiosError<{
      error?: { code: AssistantChatErrorCode; message: string };
    }>(error)
  ) {
    const apiError = error.response?.data?.error;

    if (apiError) {
      return new AssistantChatApiError(
        apiError.code,
        apiError.message || fallbackMessage,
        error.response?.status,
      );
    }
  }

  return new AssistantChatApiError('UNKNOWN_ERROR', fallbackMessage);
};
