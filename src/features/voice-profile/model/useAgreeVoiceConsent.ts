'use client';

import { useMutation } from '@tanstack/react-query';
import { agreeVoiceConsent } from '../api/agree-voice-consent';

export const useAgreeVoiceConsent = () => useMutation({ mutationFn: agreeVoiceConsent });
