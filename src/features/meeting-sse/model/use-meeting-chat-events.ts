'use client';

import { useCallback, useEffect, useState } from 'react';
import { parseChatSseEvent, type ChatSseEventData, type ChatSseEventType } from './chat-event';
import { createListenerRegistry } from './listener-registry';

export const useMeetingChatEvents = () => {
  const [chatListeners] = useState(() => createListenerRegistry<[ChatSseEventData]>());

  const receiveChatEvent = useCallback(
    (meetingId: string, type: ChatSseEventType, data: string) => {
      const chatEvent = parseChatSseEvent(data);
      if (!chatEvent || chatEvent.type !== type || String(chatEvent.meetingId) !== meetingId) {
        return;
      }

      chatListeners.emit(meetingId, chatEvent);
    },
    [chatListeners],
  );

  useEffect(() => () => chatListeners.clear(), [chatListeners]);

  return {
    subscribeChatEvent: chatListeners.subscribe,
    receiveChatEvent,
  };
};
