'use client';

import { useState } from 'react';
import { useAppToast } from '@/shared/ui';
import { VoiceEnrollSheet } from '@/widgets/voice-enroll-sheet';

interface HomeVoiceEnrollSheetProps {
  hasVoiceProfile: boolean;
}

export const HomeVoiceEnrollSheet = ({ hasVoiceProfile }: HomeVoiceEnrollSheetProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { showToast } = useAppToast();

  const handleDone = () => {
    setIsDismissed(true);
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
