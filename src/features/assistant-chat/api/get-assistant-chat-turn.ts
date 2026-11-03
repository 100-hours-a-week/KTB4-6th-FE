import { apiClient } from '@/shared/api';
import { AssistantChatApiError, toAssistantChatApiError } from '../model/errors';
import type { AssistantChatTurnData, AssistantChatTurnResponse } from '../model/types';

const ASSISTANT_CHAT_TURN_ERROR_MESSAGE = '답변 상태를 확인하지 못했습니다.';

export const getAssistantChatTurn = async (
  requestId: number,
  signal?: AbortSignal,
): Promise<AssistantChatTurnData> => {
  try {
    const response = await apiClient.get<AssistantChatTurnResponse>(
      `/api/v1/assistant/chat/requests/${requestId}`,
      { signal },
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new AssistantChatApiError(
        result.error?.code ?? 'UNKNOWN_ERROR',
        result.error?.message ?? ASSISTANT_CHAT_TURN_ERROR_MESSAGE,
        response.status,
      );
    }

    return result.data;
  } catch (error) {
    throw toAssistantChatApiError(error, ASSISTANT_CHAT_TURN_ERROR_MESSAGE);
  }
};
