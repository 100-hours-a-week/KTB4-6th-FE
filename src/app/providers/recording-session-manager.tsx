'use client';

import { useEffect, useRef } from 'react';
import { useRecordingWebSocket } from '@/features/recording-websocket';
import {
  appendRecordingChunk,
  useMediaRecorder,
  useRecordingChunkBuffer,
  useRecordingSessionStore,
} from '@/features/recording';
import { useAppToast } from '@/shared/ui';

const RECOVERY_MAX_ATTEMPTS = 3;
const RECOVERY_RETRY_DELAY_MS = 2000;

export function RecordingSessionManager() {
  const activeRecording = useRecordingSessionStore((state) => state.activeRecording);
  const recorderStatus = useMediaRecorder((state) => state.status);
  const prepareMicrophone = useMediaRecorder((state) => state.prepare);
  const startBrowserRecording = useMediaRecorder((state) => state.start);
  const releaseMicrophone = useMediaRecorder((state) => state.release);
  const { statuses, connect, sendAudioChunk, disconnect } = useRecordingWebSocket();
  const { showToast } = useAppToast();
  const recordingSessionId = activeRecording?.recordingSessionId;
  const socketStatus = recordingSessionId === undefined ? undefined : statuses[recordingSessionId];
  const recoveryAttempts = useRef(0);
  useRecordingChunkBuffer(recordingSessionId ?? null);

  // 녹음 세션이 바뀌면(새로 시작했거나 종료됐거나) 이전 세션에서 실패한 재시도 횟수는 버린다.
  useEffect(() => {
    recoveryAttempts.current = 0;
  }, [recordingSessionId]);

  useEffect(() => {
    if (recordingSessionId === undefined) return;

    if (socketStatus === 'connected' && useMediaRecorder.getState().status === 'ready') {
      recoveryAttempts.current = 0;
      try {
        startBrowserRecording((chunk) => {
          sendAudioChunk(recordingSessionId, chunk);
          appendRecordingChunk(chunk);
        });
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

    // 소켓만 끊긴 경우든, 새로고침 등으로 recorder 자체가 없어진 경우든 전부 같은 방식으로
    // 복구한다 — 마이크·recorder를 다시 만들고 같은 recordingSessionId로 재연결한다.
    const needsRecovery = connectionLost || recorderStatus === 'idle';
    if (!needsRecovery) return;

    if (connectionLost) releaseMicrophone();

    if (recoveryAttempts.current >= RECOVERY_MAX_ATTEMPTS) {
      // TODO(#112): 재시도가 전부 실패했을 때, OPFS에 쌓인 part를 병합·업로드하고
      // 회의를 종료 처리한다. 지금은 더 이상 재시도하지 않고 멈춘다.
      return;
    }

    let cancelled = false;
    const attemptNumber = recoveryAttempts.current + 1;
    recoveryAttempts.current = attemptNumber;

    const timeoutId = window.setTimeout(
      () => {
        if (cancelled) return;
        void (async () => {
          try {
            const audioFormat = await prepareMicrophone();
            if (cancelled) return;
            connect(recordingSessionId, audioFormat);
          } catch {
            // 실패하면 recoveryAttempts가 이미 늘어난 채라 다음 렌더에서 다시 시도된다.
          }
        })();
      },
      attemptNumber === 1 ? 0 : RECOVERY_RETRY_DELAY_MS * attemptNumber,
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [
    connect,
    disconnect,
    prepareMicrophone,
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
