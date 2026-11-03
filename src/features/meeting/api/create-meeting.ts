import { apiClient } from '@/shared/api';

import { toMeetingApiError } from '../model/errors';
import type {
  CreateMeetingData,
  CreateMeetingDraftRequest,
  CreateMeetingRequest,
  CreateMeetingResponse,
} from '../model/types';

interface CreateMeetingOptions {
  aiRequestId?: number;
}

export const createMeeting = async (
  teamId: number,
  request: CreateMeetingRequest | CreateMeetingDraftRequest,
  { aiRequestId }: CreateMeetingOptions = {},
): Promise<CreateMeetingData> => {
  try {
    const response = await apiClient.post<CreateMeetingResponse>(
      `/api/v1/teams/${teamId}/meetings`,
      request,
      aiRequestId === undefined ? undefined : { headers: { 'X-Ai-Request-Id': aiRequestId } },
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('회의 생성에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    throw toMeetingApiError(error, '회의 생성에 실패했습니다.');
  }
};
