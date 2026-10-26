'use client';

import { Drawer } from '@base-ui/react/drawer';
import { X } from 'lucide-react';
import { cn, useAppFrameElement } from '@/shared/lib';
import type { VoiceEnrollMode } from '../model/types';
import { useVoiceEnrollTempFlow } from '../model/useVoiceEnrollTempFlow';
import { VoiceEnrollDeniedStep } from './VoiceEnrollDeniedStep';
import { VoiceEnrollDoneStep } from './VoiceEnrollDoneStep';
import { VoiceEnrollFailedStep } from './VoiceEnrollFailedStep';
import { VoiceEnrollScriptStep } from './VoiceEnrollScriptStep';

interface VoiceEnrollSheetProps {
  isOpen: boolean;
  mode: VoiceEnrollMode;
  onDone: () => void;
  onClose?: () => void;
}

export const VoiceEnrollSheet = ({ isOpen, mode, onDone, onClose }: VoiceEnrollSheetProps) => {
  const frame = useAppFrameElement();
  const flow = useVoiceEnrollTempFlow();
  const { phase } = flow;
  const canClose = mode === 'edit' && phase !== 'processing' && phase !== 'done';

  const handleOpenChange = (open: boolean) => {
    if (!open && canClose) {
      onClose?.();
    }
  };

  const handleOpenChangeComplete = (open: boolean) => {
    if (!open) {
      flow.reset();
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
                className="absolute top-3.5 right-2.5 flex size-11 items-center justify-center rounded-lg text-cool-600 transition-colors hover:bg-cool-50"
              >
                <X className="size-4" strokeWidth={2} />
              </Drawer.Close>
            )}

            {(phase === 'idle' || phase === 'recording' || phase === 'processing') && (
              <VoiceEnrollScriptStep
                mode={mode}
                phase={phase}
                hasCloseButton={canClose}
                sentenceIndex={flow.sentenceIndex}
                recordedSentences={flow.recordedSentences}
                sentenceProgress={flow.sentenceProgress}
                elapsedSeconds={flow.elapsedSeconds}
                waveLevels={flow.waveLevels}
                onStart={flow.start}
                onNext={flow.next}
                onPrevious={flow.previous}
              />
            )}
            {phase === 'done' && <VoiceEnrollDoneStep mode={mode} onDone={onDone} />}
            {phase === 'denied' && <VoiceEnrollDeniedStep onRetry={flow.start} />}
            {phase === 'failed' && (
              <VoiceEnrollFailedStep onRetry={flow.retry} onRestart={flow.reset} />
            )}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
