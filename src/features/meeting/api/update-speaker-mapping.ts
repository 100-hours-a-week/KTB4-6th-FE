import { apiClient } from '@/shared/api';

import { toMeetingApiError } from '../model/errors';
import type {
  SpeakerMappingResultData,
  UpdateSpeakerMappingRequest,
  UpdateSpeakerMappingResponse,
} from '../model/types';

/** 발화자를 회의 참석자 또는 직접 입력한 별칭과 연결하고, 둘 다 null이면 연결을 해제한다. */
export const updateSpeakerMapping = async (
  meetingId: number,
  transcriptSpeakerId: number,
  request: UpdateSpeakerMappingRequest,
): Promise<SpeakerMappingResultData> => {
  try {
    const response = await apiClient.put<UpdateSpeakerMappingResponse>(
      `/api/v1/meetings/${meetingId}/speakers/${transcriptSpeakerId}/mapping`,
      request,
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('발화자 연결에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    throw toMeetingApiError(error, '발화자 연결에 실패했습니다.');
  }
};
