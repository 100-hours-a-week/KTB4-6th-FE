import { apiClient } from '@/shared/api';

import { toMeetingListApiError } from '../model/errors';
import type { MeetingListData, MeetingListParams, MeetingListResponse } from '../model/types';

export const getMeetingList = async (
  teamId: number,
  params: MeetingListParams = {},
): Promise<MeetingListData> => {
  try {
    const response = await apiClient.get<MeetingListResponse>(`/api/v1/teams/${teamId}/meetings`, {
      params,
    });
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('회의 목록을 조회하지 못했습니다.');
    }

    return result.data;
  } catch (error) {
    throw toMeetingListApiError(error, '회의 목록을 조회하지 못했습니다.');
  }
};
