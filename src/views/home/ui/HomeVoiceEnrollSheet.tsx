'use client';

import { useState } from 'react';
import { useMarkHomeVoiceProfileRegistered } from '@/features/home';
import { useAppToast } from '@/shared/ui';
import { VoiceEnrollSheet } from '@/widgets/voice-enroll-sheet';

interface HomeVoiceEnrollSheetProps {
  hasVoiceProfile: boolean;
}

export const HomeVoiceEnrollSheet = ({ hasVoiceProfile }: HomeVoiceEnrollSheetProps) => {
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
      isOpen={!hasVoiceProfile && !isDismissed}
      mode="first"
      onDone={handleDone}
      onClose={() => setIsDismissed(true)}
    />
  );
};
