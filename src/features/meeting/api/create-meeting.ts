import { apiClient } from '@/shared/api';

import { toMeetingApiError } from '../model/errors';
import type {
  CreateMeetingData,
  CreateMeetingRequest,
  CreateMeetingResponse,
} from '../model/types';

export const createMeeting = async (
  teamId: number,
  request: CreateMeetingRequest,
): Promise<CreateMeetingData> => {
  try {
    const response = await apiClient.post<CreateMeetingResponse>(
      `/api/v1/teams/${teamId}/meetings`,
      request,
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
