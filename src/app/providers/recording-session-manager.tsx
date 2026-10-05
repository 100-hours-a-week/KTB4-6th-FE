'use client';

import { useRecordingChunkBuffer, useRecordingSessionStore } from '@/features/recording';
import { useRecordingWebSocket } from '@/features/recording-websocket';
import { useRecordingAckSync } from './use-recording-ack-sync';
import { useRecordingConnectionRecovery } from './use-recording-connection-recovery';
import { useRecordingStreamStart } from './use-recording-stream-start';

/** 앱 전역에서 녹음 소켓 연결·복구·녹음 시작과 로컬 chunk 관리를 맡는다. */
export function RecordingSessionManager() {
  const recordingSessionId = useRecordingSessionStore(
    (state) => state.activeRecording?.recordingSessionId,
  );
  const { statuses } = useRecordingWebSocket();
  const socketStatus = recordingSessionId === undefined ? undefined : statuses[recordingSessionId];

  useRecordingChunkBuffer();
  useRecordingAckSync();
  const { resetAttempts } = useRecordingConnectionRecovery({ recordingSessionId, socketStatus });
  useRecordingStreamStart({ recordingSessionId, socketStatus, onStarted: resetAttempts });

  return null;
}
