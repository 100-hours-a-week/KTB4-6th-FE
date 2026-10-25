'use client';

import { useEffect, useEffectEvent, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getCurrentMeetingQueryKey } from '@/features/meeting-sse';
import {
  enqueueRecordingUpload,
  prepareRecordingFile,
  useMediaRecorder,
  useRecordingSessionStore,
} from '@/features/recording';
import { useRecordingWebSocket } from '@/features/recording-websocket';

const waitForIdleOperation = () =>
  new Promise<void>((resolve) => {
    if (useRecordingSessionStore.getState().operation === 'idle') {
      resolve();
      return;
    }
    const unsubscribe = useRecordingSessionStore.subscribe((state) => {
      if (state.operation !== 'idle') return;
      unsubscribe();
      resolve();
    });
  });

export const useRecordingServerEnd = () => {
  const queryClient = useQueryClient();
  const { addMessageListener } = useRecordingWebSocket();
  const flushBrowserRecording = useMediaRecorder((state) => state.flush);
  const releaseMicrophone = useMediaRecorder((state) => state.release);
  const setOperation = useRecordingSessionStore((state) => state.setOperation);
  const clearActiveRecording = useRecordingSessionStore((state) => state.clearActiveRecording);
  const handledSessionIds = useRef(new Set<number>());

  const handleServerEnd = useEffectEvent(async (recordingSessionId: number) => {
    if (handledSessionIds.current.has(recordingSessionId)) return;
    handledSessionIds.current.add(recordingSessionId);

    await waitForIdleOperation();
    const { activeRecording } = useRecordingSessionStore.getState();
    if (activeRecording?.recordingSessionId !== recordingSessionId) return;

    setOperation('finishing');
    try {
      const { status } = useMediaRecorder.getState();
      if (status === 'recording' || status === 'paused') {
        await flushBrowserRecording().catch(() => {});
      }
      releaseMicrophone();
      enqueueRecordingUpload(recordingSessionId, await prepareRecordingFile(recordingSessionId));
    } finally {
      await queryClient
        .invalidateQueries({ queryKey: getCurrentMeetingQueryKey(activeRecording.meetingId) })
        .catch(() => {});
      clearActiveRecording(recordingSessionId);
      setOperation('idle');
    }
  });

  useEffect(
    () =>
      addMessageListener((recordingSessionId, message) => {
        if (message.type === 'recording.error') void handleServerEnd(recordingSessionId);
      }),
    [addMessageListener],
  );
};
