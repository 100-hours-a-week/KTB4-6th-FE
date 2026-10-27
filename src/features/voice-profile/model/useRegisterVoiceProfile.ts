'use client';

import { useMutation } from '@tanstack/react-query';
import { registerVoiceProfile } from '../api/register-voice-profile';

export const useRegisterVoiceProfile = () => useMutation({ mutationFn: registerVoiceProfile });
