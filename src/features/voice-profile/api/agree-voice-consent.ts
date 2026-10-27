import { apiClient } from '@/shared/api';

interface VoiceConsentResponse {
  success: boolean;
  data: { consentedAt: string } | null;
}

export const agreeVoiceConsent = async (): Promise<void> => {
  const response = await apiClient.put<VoiceConsentResponse>(
    '/api/v1/users/me/voice-profile/consent',
  );

  if (!response.data.success || !response.data.data?.consentedAt) {
    throw new Error('음성 정보 수집 동의를 저장하지 못했습니다.');
  }
};
