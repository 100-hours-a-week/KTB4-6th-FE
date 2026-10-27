import { apiClient } from '@/shared/api';

interface RegisterVoiceProfileResponse {
  success: boolean;
  data: {
    hasVoiceProfile: boolean;
  } | null;
  error: unknown | null;
}

export const registerVoiceProfile = async (): Promise<void> => {
  const response = await apiClient.post<RegisterVoiceProfileResponse>(
    '/api/v1/users/me/voice-profile',
  );
  const { success, data } = response.data;

  if (!success || data?.hasVoiceProfile !== true) {
    throw new Error('음성 등록 응답이 올바르지 않습니다.');
  }
};
