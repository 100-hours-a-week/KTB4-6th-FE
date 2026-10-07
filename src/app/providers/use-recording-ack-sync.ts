'use client';

import { useEffect } from 'react';
import { acknowledgeRecordingChunks } from '@/features/recording';
import { useRecordingWebSocket } from '@/features/recording-websocket';

/** BE의 ACK를 받으면 해당 순번까지 수신 확인으로 표시한다. */
export const useRecordingAckSync = () => {
  const { addMessageListener } = useRecordingWebSocket();

  useEffect(
    () =>
      addMessageListener((recordingSessionId, message) => {
        if (message.type === 'ack') acknowledgeRecordingChunks(recordingSessionId, message.seq);
      }),
    [addMessageListener],
  );
};
