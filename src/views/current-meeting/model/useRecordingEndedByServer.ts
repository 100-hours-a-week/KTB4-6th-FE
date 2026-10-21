'use client';

import { useEffect, useState } from 'react';
import { useRecordingSessionStore } from '@/features/recording';
import { useRecordingWebSocket } from '@/features/recording-websocket';

export const useRecordingEndedByServer = (meetingId: number) => {
  const { addMessageListener } = useRecordingWebSocket();
  const [isEndedByServer, setIsEndedByServer] = useState(false);

  useEffect(
    () =>
      addMessageListener((recordingSessionId, message) => {
        if (message.type !== 'recording.error') return;
        const { activeRecording } = useRecordingSessionStore.getState();
        if (
          activeRecording?.meetingId === meetingId &&
          activeRecording.recordingSessionId === recordingSessionId
        ) {
          setIsEndedByServer(true);
        }
      }),
    [addMessageListener, meetingId],
  );

  return isEndedByServer;
};
