import { apiClient } from '@/shared/api';

interface CreateVoiceProfileUploadUrlResponse {
  success: boolean;
  data: {
    uploadUrl: string;
    uploadUrlExpiresAt: string;
  } | null;
  error: unknown | null;
}

export const createVoiceProfileUploadUrl = async (contentType: string): Promise<string> => {
  const response = await apiClient.post<CreateVoiceProfileUploadUrlResponse>(
    '/api/v1/users/me/voice-profile/upload-url',
    { contentType },
  );
  const { success, data } = response.data;

  if (!success || !data?.uploadUrl) {
    throw new Error('음성 업로드 URL 응답이 올바르지 않습니다.');
  }

  return data.uploadUrl;
};
