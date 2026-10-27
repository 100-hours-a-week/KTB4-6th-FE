'use client';

import { Mic } from 'lucide-react';
import { useState } from 'react';
import { useAppToast } from '@/shared/ui';
import { VoiceEnrollSheet } from '@/widgets/voice-enroll-sheet';
import { teamManagementToastMessages } from '../model/toast-messages';

export const VoiceProfileSection = () => {
  const [isEnrollSheetOpen, setIsEnrollSheetOpen] = useState(false);
  const { showToast } = useAppToast();

  const handleDone = () => {
    setIsEnrollSheetOpen(false);
    const { text, variant } = teamManagementToastMessages.voiceProfileReenrollSuccess;
    showToast(text, variant);
  };

  return (
    <section className="px-5 pt-5">
      <div className="flex items-center gap-3 rounded-xl border border-cool-100 bg-white p-3.5">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-brand-100 text-brand-600"
        >
          <Mic className="size-[19px]" strokeWidth={1.6} />
        </span>
        <h2 className="min-w-0 flex-1 text-[14.5px] leading-[1.3] font-semibold tracking-[-0.015em] text-cool-900">
          내 음성 정보
        </h2>
        <button
          type="button"
          onClick={() => setIsEnrollSheetOpen(true)}
          className="min-h-10 shrink-0 rounded-lg border border-cool-300 bg-white px-3 text-xs font-semibold text-cool-600 transition-colors hover:border-cool-500 hover:bg-cool-50"
        >
          다시 등록
        </button>
      </div>

      <VoiceEnrollSheet
        isOpen={isEnrollSheetOpen}
        mode="edit"
        onDone={handleDone}
        onClose={() => setIsEnrollSheetOpen(false)}
      />
    </section>
  );
};
