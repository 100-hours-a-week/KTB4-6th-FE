import { apiClient } from '@/shared/api';

import { toMeetingApiError } from '../model/errors';
import type { AudioFileData, AudioFileResponse } from '../model/types';

/** 회의 녹음 파일의 정보(재생 시간, 상태, 만료 시각)를 조회한다. */
export const getAudioFile = async (meetingId: number): Promise<AudioFileData> => {
  try {
    const response = await apiClient.get<AudioFileResponse>(
      `/api/v1/meetings/${meetingId}/audio-file`,
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('음성 파일 정보를 조회하지 못했습니다.');
    }

    return result.data;
  } catch (error) {
    throw toMeetingApiError(error, '음성 파일 정보를 조회하지 못했습니다.');
  }
};
