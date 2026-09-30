import { apiClient } from '@/shared/api';

interface CreateAudioFileUploadUrlResponse {
  success: boolean;
  data: {
    audioFileId: number;
    uploadUrl: string;
    uploadUrlExpiresAt: string;
  } | null;
  error: unknown | null;
}

export interface AudioFileUploadTarget {
  audioFileId: number;
  uploadUrl: string;
  uploadUrlExpiresAt: string;
}

export const createAudioFileUploadUrl = async (
  recordingSessionId: number,
  contentType: string,
): Promise<AudioFileUploadTarget> => {
  const response = await apiClient.post<CreateAudioFileUploadUrlResponse>(
    `/api/v1/recordings/${recordingSessionId}/audio-files`,
    { contentType },
  );
  const result = response.data;
  const data = result.data;

  if (
    !result.success ||
    !data ||
    !Number.isSafeInteger(data.audioFileId) ||
    data.audioFileId <= 0 ||
    !data.uploadUrl ||
    !data.uploadUrlExpiresAt ||
    !Number.isFinite(Date.parse(data.uploadUrlExpiresAt))
  ) {
    throw new Error('녹음 파일 업로드 URL 응답이 올바르지 않습니다.');
  }

  return data;
};
