import { apiClient } from '@/shared/api';

import { toMeetingApiError } from '../model/errors';
import type { MeetingDetailData, MeetingDetailResponse } from '../model/types';

/** 회의 상세 정보를 조회한다. */
export const getMeetingDetail = async (meetingId: number): Promise<MeetingDetailData> => {
  try {
    const response = await apiClient.get<MeetingDetailResponse>(`/api/v1/meetings/${meetingId}`);
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('회의 정보를 조회하지 못했습니다.');
    }

    return result.data;
  } catch (error) {
    throw toMeetingApiError(error, '회의 정보를 조회하지 못했습니다.');
  }
};
