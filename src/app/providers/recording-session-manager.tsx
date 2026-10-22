'use client';

import { useRecordingChunkBuffer, useRecordingSessionStore } from '@/features/recording';
import { useRecordingWebSocket } from '@/features/recording-websocket';
import { useRecordingAckSync } from './use-recording-ack-sync';
import { useRecordingAiReplay } from './use-recording-ai-replay';
import { useRecordingConnectionRecovery } from './use-recording-connection-recovery';
import { useRecordingServerEnd } from './use-recording-server-end';
import { useRecordingStreamStart } from './use-recording-stream-start';

export function RecordingSessionManager() {
  const activeRecording = useRecordingSessionStore((state) => state.activeRecording);
  const recordingSessionId = activeRecording?.recordingSessionId;
  const { statuses } = useRecordingWebSocket();
  const socketStatus = recordingSessionId === undefined ? undefined : statuses[recordingSessionId];

  useRecordingChunkBuffer();
  useRecordingAckSync();
  useRecordingAiReplay();
  useRecordingServerEnd();
  const { resetAttempts } = useRecordingConnectionRecovery({
    meetingId: activeRecording?.meetingId,
    recordingSessionId,
    socketStatus,
  });
  useRecordingStreamStart({ recordingSessionId, socketStatus, onStarted: resetAttempts });

  return null;
}
