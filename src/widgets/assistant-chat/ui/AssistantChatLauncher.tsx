'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useFloatingAnchorOffset } from '@/shared/lib';
import { useAssistantChatAvailability } from '../model/useAssistantChatAvailability';
import { useAssistantChatFabDrag } from '../model/useAssistantChatFabDrag';
import { useAssistantChatHint } from '../model/useAssistantChatHint';
import { AssistantChatFab } from './AssistantChatFab';

const AssistantChatSheet = dynamic(
  () => import('./AssistantChatSheet').then((module) => module.AssistantChatSheet),
  { ssr: false },
);

const CHAT_HISTORY_STATE_KEY = 'assistantChatOpen';

interface AssistantChatLauncherProps {
  teamId: number;
}

export const AssistantChatLauncher = ({ teamId }: AssistantChatLauncherProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const isAvailable = useAssistantChatAvailability();
  const bottomOffset = useFloatingAnchorOffset();
  const fabDrag = useAssistantChatFabDrag(bottomOffset, isAvailable && !isOpen);
  const { isHintVisible, dismissHint } = useAssistantChatHint(isAvailable && !isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => setIsOpen(false);
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen]);

  const open = () => {
    dismissHint();
    setHasOpened(true);
    setIsOpen(true);
    window.history.pushState({ [CHAT_HISTORY_STATE_KEY]: true }, '');
  };

  const close = () => {
    if (window.history.state?.[CHAT_HISTORY_STATE_KEY]) {
      window.history.back();
      return;
    }

    setIsOpen(false);
  };

  return (
    <>
      {isAvailable && !isOpen && fabDrag.isReady && (
        <AssistantChatFab
          isHintVisible={isHintVisible}
          bottomOffset={bottomOffset}
          drag={fabDrag}
          onOpen={open}
        />
      )}
      {hasOpened && (
        <AssistantChatSheet
          isOpen={isOpen}
          teamId={teamId}
          onClose={close}
          onMeetingLinkClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
