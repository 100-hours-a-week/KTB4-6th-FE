'use client';

import { Drawer } from '@base-ui/react/drawer';
import { X } from 'lucide-react';
import {
  toVoiceProfileRegisterFailure,
  useRegisterVoiceProfile,
  useVoiceProfileRecorder,
} from '@/features/voice-profile';
import { cn, useAppFrameElement } from '@/shared/lib';
import type { VoiceEnrollMode } from '../model/types';
import { toVoiceEnrollPhase } from '../model/voice-enroll-phase';
import { VoiceEnrollConsentStep } from './VoiceEnrollConsentStep';
import { VoiceEnrollDeniedStep } from './VoiceEnrollDeniedStep';
import { VoiceEnrollDoneStep } from './VoiceEnrollDoneStep';
import { VoiceEnrollFailedStep } from './VoiceEnrollFailedStep';
import { VoiceEnrollScriptStep } from './VoiceEnrollScriptStep';
import { VoiceEnrollUnavailableStep } from './VoiceEnrollUnavailableStep';

interface VoiceEnrollSheetProps {
  isOpen: boolean;
  mode: VoiceEnrollMode;
  consentHref?: string;
  onDone: () => void;
  onClose?: () => void;
}

export const VoiceEnrollSheet = ({
  isOpen,
  mode,
  consentHref,
  onDone,
  onClose,
}: VoiceEnrollSheetProps) => {
  const frame = useAppFrameElement();
  const registration = useRegisterVoiceProfile();
  const recorder = useVoiceProfileRecorder({ onComplete: (file) => registration.mutate(file) });
  const registrationFailure = registration.isError
    ? toVoiceProfileRegisterFailure(registration.error)
    : null;
  const phase = toVoiceEnrollPhase(recorder.status, {
    isSuccess: registration.isSuccess,
    failure: registrationFailure,
  });
  const isBlocked = phase === 'unsupported' || phase === 'unavailable' || phase === 'consent';
  const canClose = isBlocked || (mode === 'edit' && phase !== 'processing' && phase !== 'done');

  const restart = () => {
    registration.reset();
    recorder.reset();
  };

  const retryRegistration = () => {
    if (recorder.file) registration.mutate(recorder.file);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && canClose) {
      onClose?.();
    }
  };

  const handleOpenChangeComplete = (open: boolean) => {
    if (!open) {
      restart();
    }
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={handleOpenChangeComplete}
      disablePointerDismissal={!canClose}
      swipeDirection="down"
    >
      <Drawer.Portal container={frame}>
        <Drawer.Backdrop className="absolute inset-0 z-[60] bg-cool-900/50 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />

        <Drawer.Viewport className="absolute inset-0 z-[60] flex items-end">
          <Drawer.Popup
            className={cn(
              'relative flex max-h-full w-full flex-col gap-[18px] overflow-y-auto rounded-t-3xl bg-white outline-none px-[22px] pt-[26px] pb-[30px] shadow-[0_-10px_34px_rgba(22,30,43,0.18)] transition-transform duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:translate-y-full data-starting-style:translate-y-full',
              canClose && '[transform:translateY(var(--drawer-swipe-movement-y))]',
            )}
          >
            {canClose && (
              <Drawer.Close
                aria-label="음성 등록 닫기"
                className="absolute top-3.5 right-2.5 z-10 flex size-11 items-center justify-center rounded-lg text-cool-600 transition-colors hover:bg-cool-50"
              >
                <X className="size-4" strokeWidth={2} />
              </Drawer.Close>
            )}

            {(phase === 'idle' || phase === 'recording' || phase === 'processing') && (
              <VoiceEnrollScriptStep
                mode={mode}
                phase={phase}
                isStarting={recorder.status === 'requesting'}
                hasCloseButton={canClose}
                sentenceIndex={recorder.sentenceIndex}
                recordedSentences={recorder.recordedSentences}
                sentenceProgress={recorder.sentenceProgress}
                elapsedSeconds={recorder.elapsedSeconds}
                waveLevels={recorder.waveLevels}
                qualityWarning={recorder.qualityWarning}
                onStart={recorder.start}
                onNext={recorder.next}
                onPrevious={recorder.previous}
              />
            )}
            {phase === 'done' && <VoiceEnrollDoneStep mode={mode} onDone={onDone} />}
            {phase === 'denied' && <VoiceEnrollDeniedStep onRetry={recorder.start} />}
            {(phase === 'unsupported' || phase === 'unavailable') && (
              <VoiceEnrollUnavailableStep reason={phase} onRetry={recorder.start} />
            )}
            {phase === 'consent' && <VoiceEnrollConsentStep consentHref={consentHref} />}
            {phase === 'failed' && (
              <VoiceEnrollFailedStep
                reason={
                  registrationFailure === 'retry' || registrationFailure === 'rerecord'
                    ? registrationFailure
                    : 'file'
                }
                onRetry={retryRegistration}
                onRestart={restart}
              />
            )}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
