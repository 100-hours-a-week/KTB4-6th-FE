import { apiClient } from '@/shared/api';
import type { AssistantChatStream, PostAssistantChatQuestionParams } from '../model/types';
import {
  createStreamRequestConfig,
  toAssistantChatStream,
  toStreamRequestError,
} from './assistant-chat-stream';

const ASSISTANT_CHAT_QUESTION_ERROR_MESSAGE = '질문을 보내지 못했습니다.';

export const postAssistantChatQuestion = async (
  { teamId, question, idempotencyKey }: PostAssistantChatQuestionParams,
  signal?: AbortSignal,
): Promise<AssistantChatStream> => {
  try {
    const response = await apiClient.post<ReadableStream<Uint8Array>>(
      '/api/v1/assistant/chat',
      { teamId, question },
      createStreamRequestConfig(signal, { 'Idempotency-Key': idempotencyKey }),
    );

    return toAssistantChatStream(response);
  } catch (error) {
    throw await toStreamRequestError(error, ASSISTANT_CHAT_QUESTION_ERROR_MESSAGE);
  }
};
