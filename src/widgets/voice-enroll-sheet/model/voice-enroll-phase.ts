import type {
  VoiceProfileRecorderStatus,
  VoiceProfileRegisterFailure,
} from '@/features/voice-profile';
import type { VoiceEnrollPhase } from './types';

interface RegistrationState {
  isSuccess: boolean;
  failure: VoiceProfileRegisterFailure | null;
}

export const toVoiceEnrollPhase = (
  recorderStatus: VoiceProfileRecorderStatus,
  { isSuccess, failure }: RegistrationState,
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
      if (isSuccess) return 'done';
      if (failure === 'consent') return 'consent';
      return failure ? 'failed' : 'processing';
    default:
      return 'idle';
  }
};
