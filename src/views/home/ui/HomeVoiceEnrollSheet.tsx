'use client';

import { useState } from 'react';
import { useMarkHomeVoiceProfileRegistered } from '@/features/home';
import { useAppToast } from '@/shared/ui';
import { VoiceEnrollSheet } from '@/widgets/voice-enroll-sheet';

interface HomeVoiceEnrollSheetProps {
  teamId: number;
  hasVoiceProfile: boolean;
  hasVoiceConsent: boolean;
}

export const HomeVoiceEnrollSheet = ({
  teamId,
  hasVoiceProfile,
  hasVoiceConsent,
}: HomeVoiceEnrollSheetProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { showToast } = useAppToast();
  const markVoiceProfileRegistered = useMarkHomeVoiceProfileRegistered();

  const handleDone = () => {
    setIsDismissed(true);
    markVoiceProfileRegistered();
    showToast('음성 정보가 등록되었습니다.', 'success');
  };

  return (
    <VoiceEnrollSheet
      isOpen={hasVoiceConsent && !hasVoiceProfile && !isDismissed}
      mode="first"
      consentHref={`/teams/${teamId}/voice-consent`}
      onDone={handleDone}
      onClose={() => setIsDismissed(true)}
    />
  );
};
