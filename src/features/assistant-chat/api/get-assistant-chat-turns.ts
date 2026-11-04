import { apiClient } from '@/shared/api';
import { AssistantChatApiError, toAssistantChatApiError } from '../model/errors';
import type { AssistantChatTurnListData, AssistantChatTurnListResponse } from '../model/types';

const ASSISTANT_CHAT_PAGE_SIZE = 20;
const ASSISTANT_CHAT_TURNS_ERROR_MESSAGE = '이전 대화를 불러오지 못했습니다.';

export const getAssistantChatTurns = async (
  teamId: number,
  cursor?: number,
  signal?: AbortSignal,
): Promise<AssistantChatTurnListData> => {
  try {
    const response = await apiClient.get<AssistantChatTurnListResponse>(
      `/api/v1/assistant/chat/teams/${teamId}/messages`,
      { params: { cursor, size: ASSISTANT_CHAT_PAGE_SIZE }, signal },
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new AssistantChatApiError(
        result.error?.code ?? 'UNKNOWN_ERROR',
        result.error?.message ?? ASSISTANT_CHAT_TURNS_ERROR_MESSAGE,
        response.status,
      );
    }

    return result.data;
  } catch (error) {
    throw toAssistantChatApiError(error, ASSISTANT_CHAT_TURNS_ERROR_MESSAGE);
  }
};
