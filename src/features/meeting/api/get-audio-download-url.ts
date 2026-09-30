import { apiClient } from '@/shared/api';

import { toMeetingApiError } from '../model/errors';
import type { AudioDownloadUrlData, AudioDownloadUrlResponse } from '../model/types';

/** 음성 파일을 재생·다운로드할 수 있는 임시 주소를 발급받는다. */
export const getAudioDownloadUrl = async (audioFileId: number): Promise<AudioDownloadUrlData> => {
  try {
    const response = await apiClient.get<AudioDownloadUrlResponse>(
      `/api/v1/audio-files/${audioFileId}/download-url`,
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('음성 재생 주소를 발급받지 못했습니다.');
    }

    return result.data;
  } catch (error) {
    throw toMeetingApiError(error, '음성 재생 주소를 발급받지 못했습니다.');
  }
};
