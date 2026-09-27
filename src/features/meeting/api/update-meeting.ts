import { apiClient } from '@/shared/api';

import { toMeetingApiError } from '../model/errors';
import type {
  MeetingUpdateData,
  MeetingUpdateRequest,
  MeetingUpdateResponse,
} from '../model/types';

export const updateMeeting = async (
  meetingId: number,
  request: MeetingUpdateRequest,
): Promise<MeetingUpdateData> => {
  try {
    const response = await apiClient.patch<MeetingUpdateResponse>(
      `/api/v1/meetings/${meetingId}`,
      request,
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('회의 정보를 수정하지 못했습니다.');
    }

    return result.data;
  } catch (error) {
    throw toMeetingApiError(error, '회의 정보를 수정하지 못했습니다.');
  }
};
