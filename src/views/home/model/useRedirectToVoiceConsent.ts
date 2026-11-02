'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import {
  hasDismissedVoiceConsentPrompt,
  subscribeToVoiceConsentPrompt,
} from '@/features/voice-profile';

interface UseRedirectToVoiceConsentOptions {
  teamId: number;
  hasVoiceConsent: boolean | undefined;
}

export const useRedirectToVoiceConsent = ({
  teamId,
  hasVoiceConsent,
}: UseRedirectToVoiceConsentOptions): boolean => {
  const router = useRouter();
  const hasDismissedPrompt = useSyncExternalStore(
    subscribeToVoiceConsentPrompt,
    () => hasDismissedVoiceConsentPrompt(teamId),
    () => false,
  );

  useEffect(() => {
    if (hasVoiceConsent === false && !hasDismissedPrompt) {
      router.replace(`/teams/${teamId}/voice-consent`);
    }
  }, [hasDismissedPrompt, hasVoiceConsent, router, teamId]);

  return hasVoiceConsent === true || hasDismissedPrompt;
};
