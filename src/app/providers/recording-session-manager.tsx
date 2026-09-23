'use client';

import { useEffect } from 'react';
import { useRecordingWebSocket } from '@/features/recording-websocket';
import { useMediaRecorder } from '@/features/recording';
import { useAppToast } from '@/shared/ui';

export function RecordingSessionManager() {
  const activeRecording = useMediaRecorder((state) => state.activeRecording);
  const recorderStatus = useMediaRecorder((state) => state.status);
  const startBrowserRecording = useMediaRecorder((state) => state.start);
  const releaseMicrophone = useMediaRecorder((state) => state.release);
  const { statuses, sendAudioChunk, disconnect } = useRecordingWebSocket();
  const { showToast } = useAppToast();
  const recordingSessionId = activeRecording?.recordingSessionId;
  const socketStatus = recordingSessionId === undefined ? undefined : statuses[recordingSessionId];

  useEffect(() => {
    if (recordingSessionId === undefined) return;

    if (socketStatus === 'connected' && useMediaRecorder.getState().status === 'ready') {
      try {
        startBrowserRecording((chunk) => sendAudioChunk(recordingSessionId, chunk));
      } catch {
        disconnect(recordingSessionId);
        releaseMicrophone();
        showToast('브라우저 녹음을 시작하지 못했습니다.', 'danger');
      }
      return;
    }

    const connectionLost =
      socketStatus === 'error' ||
      socketStatus === 'unconfigured' ||
      (socketStatus === 'idle' && (recorderStatus === 'recording' || recorderStatus === 'paused'));

    if (connectionLost && useMediaRecorder.getState().status !== 'idle') {
      releaseMicrophone();
      showToast('녹음 연결이 끊어졌습니다. 회의 화면에서 상태를 확인해주세요.', 'danger');
    }
  }, [
    disconnect,
    recorderStatus,
    recordingSessionId,
    releaseMicrophone,
    sendAudioChunk,
    showToast,
    socketStatus,
    startBrowserRecording,
  ]);

  return null;
}
