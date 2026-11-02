'use client';

import { useState } from 'react';
import { Drawer } from '@base-ui/react/drawer';
import { useAppFrameElement } from '@/shared/lib';
import { useAssistantChatAutoScroll } from '../model/useAssistantChatAutoScroll';
import { useAssistantChatTempFlow } from '../model/useAssistantChatTempFlow';
import { AssistantChatComposer } from './AssistantChatComposer';
import { AssistantChatHeader } from './AssistantChatHeader';
import { AssistantChatHelpSheet } from './AssistantChatHelpSheet';
import { AssistantChatHistoryState } from './AssistantChatHistoryState';
import { AssistantChatMessageList } from './AssistantChatMessageList';
import { AssistantChatWelcome } from './AssistantChatWelcome';

interface AssistantChatSheetProps {
  isOpen: boolean;
  teamId: number;
  onClose: () => void;
  onMeetingLinkClick: () => void;
}

export const AssistantChatSheet = ({
  isOpen,
  teamId,
  onClose,
  onMeetingLinkClick,
}: AssistantChatSheetProps) => {
  const frame = useAppFrameElement();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const {
    messages,
    historyStatus,
    isAnswering,
    send,
    resendQuestion,
    confirmMeetingDraft,
    reloadHistory,
  } = useAssistantChatTempFlow();
  const { setContainer, indicatorRef, handleScroll } = useAssistantChatAutoScroll(
    messages,
    historyStatus,
  );

  const handleOpenChange = (open: boolean, eventDetails: Drawer.Root.ChangeEventDetails) => {
    if (!open && eventDetails.reason !== 'swipe') onClose();
  };

  const handleSubmit = () => {
    send(draft.trim());
    setDraft('');
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

            <div className="relative flex min-h-0 flex-1 flex-col">
              <div
                ref={setContainer}
                onScroll={handleScroll}
                className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-[22px] pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {historyStatus !== 'ready' ? (
                  <AssistantChatHistoryState status={historyStatus} onRetry={reloadHistory} />
                ) : messages.length === 0 ? (
                  <AssistantChatWelcome />
                ) : (
                  <AssistantChatMessageList
                    messages={messages}
                    teamId={teamId}
                    onResendQuestion={resendQuestion}
                    onConfirmMeetingDraft={confirmMeetingDraft}
                    onMeetingLinkClick={onMeetingLinkClick}
                  />
                )}
              </div>
              <span
                ref={indicatorRef}
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-1 h-[60px] w-1 rounded-full bg-brand-300 opacity-0 transition-opacity duration-200"
              />
            </div>

            <AssistantChatComposer
              value={draft}
              isSendDisabled={isAnswering || historyStatus !== 'ready'}
              onValueChange={setDraft}
              onSubmit={handleSubmit}
            />

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
