import type { VoiceProfileRecorderStatus } from '@/features/voice-profile';
import type { VoiceEnrollPhase } from './types';

interface RegistrationState {
  isSuccess: boolean;
  isError: boolean;
}

export const toVoiceEnrollPhase = (
  recorderStatus: VoiceProfileRecorderStatus,
  registration: RegistrationState,
): VoiceEnrollPhase => {
  switch (recorderStatus) {
    case 'denied':
    case 'unsupported':
    case 'unavailable':
      return recorderStatus;
    case 'fileFailed':
      return 'failed';
    case 'recording':
      return 'recording';
    case 'finishing':
      return 'processing';
    case 'completed':
      if (registration.isSuccess) return 'done';
      return registration.isError ? 'failed' : 'processing';
    default:
      return 'idle';
  }
};
