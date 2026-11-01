'use client';

import { useState } from 'react';
import { Drawer } from '@base-ui/react/drawer';
import { useAppFrameElement } from '@/shared/lib';
import { AssistantChatComposer } from './AssistantChatComposer';
import { AssistantChatHeader } from './AssistantChatHeader';
import { AssistantChatHelpSheet } from './AssistantChatHelpSheet';
import { AssistantChatWelcome } from './AssistantChatWelcome';

interface AssistantChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssistantChatSheet = ({ isOpen, onClose }: AssistantChatSheetProps) => {
  const frame = useAppFrameElement();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const handleOpenChange = (open: boolean, eventDetails: Drawer.Root.ChangeEventDetails) => {
    if (!open && eventDetails.reason !== 'swipe') onClose();
  };

  const handlePickQuestion = (question: string) => {
    setDraft(question);
    setIsHelpOpen(false);
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Drawer.Portal container={frame}>
        <Drawer.Backdrop className="absolute inset-0 z-[60] bg-cool-900/40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />

        <Drawer.Viewport className="absolute inset-0 z-[60] flex items-end">
          <Drawer.Popup className="flex h-full w-full flex-col bg-cool-50 outline-none transition-transform duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:translate-y-full data-starting-style:translate-y-full">
            <AssistantChatHeader onHelpClick={() => setIsHelpOpen(true)} />

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-[22px] pb-5">
              <AssistantChatWelcome />
            </div>

            <AssistantChatComposer value={draft} onValueChange={setDraft} />

            <AssistantChatHelpSheet
              isOpen={isHelpOpen}
              onOpenChange={setIsHelpOpen}
              onPickQuestion={handlePickQuestion}
            />
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
