import { apiClient } from '@/shared/api';

import { toMeetingApiError } from '../model/errors';
import type { SpeakerMappingData, SpeakerMappingResponse } from '../model/types';

/** 선택한 전사 발화의 발화자 연결 상태와, 연결할 수 있는 참석자 목록을 조회한다. */
export const getSpeakerMapping = async (
  meetingId: number,
  segmentId: number,
): Promise<SpeakerMappingData> => {
  try {
    const response = await apiClient.get<SpeakerMappingResponse>(
      `/api/v1/meetings/${meetingId}/transcripts/${segmentId}/speaker-mapping`,
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('발화자 연결 정보를 조회하지 못했습니다.');
    }

    return result.data;
  } catch (error) {
    throw toMeetingApiError(error, '발화자 연결 정보를 조회하지 못했습니다.');
  }
};
