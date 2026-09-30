import { apiClient } from '@/shared/api';

import { toMeetingApiError } from '../model/errors';
import type { AudioFileDeleteData, AudioFileDeleteResponse } from '../model/types';

/** 회의 녹음 원본 음성 파일을 삭제한다. 삭제는 비동기로 처리되어 성공 응답의 상태는 DELETE_PENDING이다. */
export const deleteAudioFile = async (audioFileId: number): Promise<AudioFileDeleteData> => {
  try {
    const response = await apiClient.delete<AudioFileDeleteResponse>(
      `/api/v1/audio-files/${audioFileId}`,
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('음성 파일을 삭제하지 못했습니다.');
    }

    return result.data;
  } catch (error) {
    throw toMeetingApiError(error, '음성 파일을 삭제하지 못했습니다.');
  }
};
