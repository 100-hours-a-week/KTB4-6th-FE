'use client';

import { useEffect, useEffectEvent, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getCurrentMeetingQueryKey } from '@/features/meeting-sse';
import {
  useMediaRecorder,
  useRecordingSessionStore,
  useUploadPendingRecordingParts,
} from '@/features/recording';
import { useRecordingWebSocket } from '@/features/recording-websocket';

const UPLOAD_MAX_ATTEMPTS = 3;
const UPLOAD_RETRY_DELAY_MS = 2000;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const useRecordingServerEnd = () => {
  const queryClient = useQueryClient();
  const { addMessageListener } = useRecordingWebSocket();
  const flushBrowserRecording = useMediaRecorder((state) => state.flush);
  const releaseMicrophone = useMediaRecorder((state) => state.release);
  const setOperation = useRecordingSessionStore((state) => state.setOperation);
  const clearActiveRecording = useRecordingSessionStore((state) => state.clearActiveRecording);
  const uploadPendingRecordingParts = useUploadPendingRecordingParts();
  const handledSessionIds = useRef(new Set<number>());

  const uploadWithRetry = async (recordingSessionId: number) => {
    for (let attempt = 1; attempt <= UPLOAD_MAX_ATTEMPTS; attempt += 1) {
      try {
        await uploadPendingRecordingParts(recordingSessionId);
        return;
      } catch {
        if (attempt < UPLOAD_MAX_ATTEMPTS) await wait(UPLOAD_RETRY_DELAY_MS * attempt);
      }
    }
  };

  const handleServerEnd = useEffectEvent(async (recordingSessionId: number) => {
    const { activeRecording } = useRecordingSessionStore.getState();
    if (activeRecording?.recordingSessionId !== recordingSessionId) return;
    if (handledSessionIds.current.has(recordingSessionId)) return;
    handledSessionIds.current.add(recordingSessionId);

    setOperation('finishing');
    try {
      const { status } = useMediaRecorder.getState();
      if (status === 'recording' || status === 'paused') {
        await flushBrowserRecording().catch(() => {});
      }
      releaseMicrophone();
      await uploadWithRetry(recordingSessionId);
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
