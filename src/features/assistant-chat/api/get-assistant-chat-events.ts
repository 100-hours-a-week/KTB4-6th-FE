import { apiClient } from '@/shared/api';
import type { AssistantChatStream } from '../model/types';
import {
  createStreamRequestConfig,
  toAssistantChatStream,
  toStreamRequestError,
} from './assistant-chat-stream';

const ASSISTANT_CHAT_EVENTS_ERROR_MESSAGE = '답변을 다시 이어받지 못했습니다.';

export const getAssistantChatEvents = async (
  requestId: number,
  signal?: AbortSignal,
): Promise<AssistantChatStream> => {
  try {
    const response = await apiClient.get<ReadableStream<Uint8Array>>(
      `/api/v1/assistant/chat/requests/${requestId}/events`,
      createStreamRequestConfig(signal),
    );

    return { ...toAssistantChatStream(response), requestId };
  } catch (error) {
    throw await toStreamRequestError(error, ASSISTANT_CHAT_EVENTS_ERROR_MESSAGE);
  }
};
