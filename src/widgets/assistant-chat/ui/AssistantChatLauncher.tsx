'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAssistantChatAvailability } from '../model/useAssistantChatAvailability';
import { useAssistantChatHint } from '../model/useAssistantChatHint';
import { AssistantChatFab } from './AssistantChatFab';

const AssistantChatSheet = dynamic(
  () => import('./AssistantChatSheet').then((module) => module.AssistantChatSheet),
  { ssr: false },
);

interface AssistantChatLauncherProps {
  teamId: number;
}

export const AssistantChatLauncher = ({ teamId }: AssistantChatLauncherProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const isAvailable = useAssistantChatAvailability();
  const { isHintVisible, dismissHint } = useAssistantChatHint(isAvailable && !isOpen);

  const open = () => {
    dismissHint();
    setHasOpened(true);
    setIsOpen(true);
  };

  return (
    <>
      {isAvailable && !isOpen && <AssistantChatFab isHintVisible={isHintVisible} onOpen={open} />}
      {hasOpened && (
        <AssistantChatSheet isOpen={isOpen} teamId={teamId} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
};
