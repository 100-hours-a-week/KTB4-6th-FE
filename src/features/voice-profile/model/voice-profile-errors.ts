import axios from 'axios';

export type VoiceProfileRegisterFailure = 'retry' | 'rerecord' | 'consent';

export const toVoiceProfileRegisterFailure = (error: unknown): VoiceProfileRegisterFailure => {
  if (!axios.isAxiosError<{ error?: { code?: string } | null }>(error)) return 'retry';

  const status = error.response?.status;
  if (status === 403 && error.response?.data?.error?.code === 'VOICE_PROFILE_CONSENT_REQUIRED') {
    return 'consent';
  }
  if (status === 502 || status === 504) return 'rerecord';
  return 'retry';
};
