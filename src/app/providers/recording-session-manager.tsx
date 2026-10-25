'use client';

import { useRecordingSessionStore, useRecordingUploader } from '@/features/recording';
import { useRecordingWebSocket } from '@/features/recording-websocket';
import { useBeforeUnloadWarning } from '@/shared/lib';
import { useRecordingAckSync } from './use-recording-ack-sync';
import { useRecordingConnectionRecovery } from './use-recording-connection-recovery';
import { useRecordingStreamStart } from './use-recording-stream-start';

export function RecordingSessionManager() {
  const activeRecording = useRecordingSessionStore((state) => state.activeRecording);
  const recordingSessionId = activeRecording?.recordingSessionId;
  const { statuses } = useRecordingWebSocket();
  const socketStatus = recordingSessionId === undefined ? undefined : statuses[recordingSessionId];

  const isUploadingRecording = useRecordingUploader();
  useBeforeUnloadWarning(isUploadingRecording);
  useRecordingAckSync();
  const { resetAttempts } = useRecordingConnectionRecovery({
    meetingId: activeRecording?.meetingId,
    recordingSessionId,
    socketStatus,
  });
  useRecordingStreamStart({ recordingSessionId, socketStatus, onStarted: resetAttempts });

  return null;
}
