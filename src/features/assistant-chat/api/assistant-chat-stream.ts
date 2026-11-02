import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { readSseEvents } from '@/shared/api';
import { AssistantChatApiError, toAssistantChatApiError } from '../model/errors';
import { toAssistantChatStreamEvent } from '../model/stream-events';
import type {
  AssistantChatErrorCode,
  AssistantChatStream,
  AssistantChatStreamEvent,
} from '../model/types';

export const createStreamRequestConfig = (
  signal?: AbortSignal,
  headers: Record<string, string> = {},
): AxiosRequestConfig => ({
  adapter: 'fetch',
  responseType: 'stream',
  headers: { Accept: 'text/event-stream', ...headers },
  signal,
});

async function* toStreamEvents(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<AssistantChatStreamEvent, void, undefined> {
  for await (const sseEvent of readSseEvents(body)) {
    const event = toAssistantChatStreamEvent(sseEvent);
    if (event) yield event;
  }
}

export const toAssistantChatStream = (
  response: AxiosResponse<ReadableStream<Uint8Array>>,
): AssistantChatStream => {
  const requestId = Number(response.headers['x-ai-request-id']);

  return {
    requestId: Number.isSafeInteger(requestId) && requestId > 0 ? requestId : null,
    events: toStreamEvents(response.data),
  };
};

export const toStreamRequestError = async (
  error: unknown,
  fallbackMessage: string,
): Promise<AssistantChatApiError> => {
  if (axios.isAxiosError(error) && error.response?.data instanceof ReadableStream) {
    const payload = (await new Response(error.response.data).json().catch(() => null)) as {
      error?: { code: AssistantChatErrorCode; message: string };
    } | null;

    if (payload?.error) {
      return new AssistantChatApiError(
        payload.error.code,
        payload.error.message || fallbackMessage,
        error.response.status,
      );
    }

    return new AssistantChatApiError('UNKNOWN_ERROR', fallbackMessage, error.response.status);
  }

  return toAssistantChatApiError(error, fallbackMessage);
};
