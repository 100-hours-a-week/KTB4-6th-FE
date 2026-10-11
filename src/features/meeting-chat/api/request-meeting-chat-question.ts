import { apiClient } from '@/shared/api';
import { MeetingChatApiError, toMeetingChatApiError } from '../model/errors';
import type {
  MeetingChatQuestionRequestData,
  MeetingChatQuestionRequestResponse,
  RequestMeetingChatQuestionParams,
  RequestMeetingChatQuestionRequest,
} from '../model/types';

const MEETING_CHAT_QUESTION_REQUEST_ERROR_MESSAGE = 'AI 질문 요청에 실패했습니다.';
const MEETING_CHAT_QUESTION_ACCEPTED_STATUS = 202;

export const requestMeetingChatQuestion = async (
  meetingId: number,
  { question, idempotencyKey }: RequestMeetingChatQuestionParams,
): Promise<MeetingChatQuestionRequestData> => {
  const request: RequestMeetingChatQuestionRequest = {
    question,
    inputType: 'TEXT',
  };

  try {
    const response = await apiClient.post<MeetingChatQuestionRequestResponse>(
      `/api/v1/meetings/${meetingId}/chats`,
      request,
      { headers: { 'Idempotency-Key': idempotencyKey } },
    );
    const result = response.data;

    if (
      response.status !== MEETING_CHAT_QUESTION_ACCEPTED_STATUS ||
      !result.success ||
      !result.data
    ) {
      throw new MeetingChatApiError(
        result.error?.code ?? 'UNKNOWN_ERROR',
        result.error?.message ?? MEETING_CHAT_QUESTION_REQUEST_ERROR_MESSAGE,
        response.status,
      );
    }

    return result.data;
  } catch (error) {
    throw toMeetingChatApiError(error, MEETING_CHAT_QUESTION_REQUEST_ERROR_MESSAGE);
  }
};
