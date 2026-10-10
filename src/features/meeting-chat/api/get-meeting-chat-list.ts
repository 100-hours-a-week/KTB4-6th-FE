import { apiClient } from '@/shared/api';
import { MeetingChatApiError, toMeetingChatApiError } from '../model/errors';
import type { MeetingChatListData, MeetingChatListResponse } from '../model/types';

const MEETING_CHAT_PAGE_SIZE = 10;
const MEETING_CHAT_LIST_ERROR_MESSAGE = 'AI 채팅 목록을 조회하지 못했습니다.';

export const getMeetingChatList = async (
  meetingId: number,
  cursor?: number,
): Promise<MeetingChatListData> => {
  try {
    const response = await apiClient.get<MeetingChatListResponse>(
      `/api/v1/meetings/${meetingId}/chats`,
      { params: { cursor, size: MEETING_CHAT_PAGE_SIZE } },
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new MeetingChatApiError(
        result.error?.code ?? 'UNKNOWN_ERROR',
        result.error?.message ?? MEETING_CHAT_LIST_ERROR_MESSAGE,
        response.status,
      );
    }

    return result.data;
  } catch (error) {
    throw toMeetingChatApiError(error, MEETING_CHAT_LIST_ERROR_MESSAGE);
  }
};
