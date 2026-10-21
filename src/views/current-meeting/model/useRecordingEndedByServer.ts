'use client';

import { useEffect, useState } from 'react';
import { useMeetingSse } from '@/features/meeting-sse';
import { useRecordingSessionStore } from '@/features/recording';
import { useRecordingWebSocket } from '@/features/recording-websocket';

export type RecordingServerEnd = 'recorder' | 'participant';

export const useRecordingEndedByServer = (meetingId: number) => {
  const { addMessageListener } = useRecordingWebSocket();
  const { subscribeRecordingEvent } = useMeetingSse();
  const [serverEnd, setServerEnd] = useState<RecordingServerEnd | null>(null);

  useEffect(
    () =>
      addMessageListener((recordingSessionId, message) => {
        if (message.type !== 'recording.error') return;
        const { activeRecording } = useRecordingSessionStore.getState();
        if (
          activeRecording?.meetingId === meetingId &&
          activeRecording.recordingSessionId === recordingSessionId
        ) {
          setServerEnd('recorder');
        }
      }),
    [addMessageListener, meetingId],
  );

  useEffect(
    () =>
      subscribeRecordingEvent(String(meetingId), (type) => {
        if (type === 'RECORDING_FAILED') setServerEnd((current) => current ?? 'participant');
      }),
    [meetingId, subscribeRecordingEvent],
  );

  return serverEnd;
};
