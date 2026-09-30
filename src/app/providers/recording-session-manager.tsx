'use client';

import { useEffect, useRef } from 'react';
import { useRecordingWebSocket } from '@/features/recording-websocket';
import {
  appendRecordingChunk,
  useCompleteRecording,
  useMediaRecorder,
  useRecordingChunkBuffer,
  useRecordingSessionStore,
  useUploadPendingRecordingParts,
} from '@/features/recording';
import { useAppToast } from '@/shared/ui';

const RECOVERY_MAX_ATTEMPTS = 2;
const RECOVERY_RETRY_DELAY_MS = 2000;

export function RecordingSessionManager() {
  const activeRecording = useRecordingSessionStore((state) => state.activeRecording);
  const isPausedByUser = useRecordingSessionStore((state) => state.isPausedByUser);
  const setOperation = useRecordingSessionStore((state) => state.setOperation);
  const clearActiveRecording = useRecordingSessionStore((state) => state.clearActiveRecording);
  const recorderStatus = useMediaRecorder((state) => state.status);
  const prepareMicrophone = useMediaRecorder((state) => state.prepare);
  const startBrowserRecording = useMediaRecorder((state) => state.start);
  const releaseMicrophone = useMediaRecorder((state) => state.release);
  const uploadPendingRecordingParts = useUploadPendingRecordingParts();
  const completeRecording = useCompleteRecording();
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

    // 일시정지는 이제 recorder를 없애는 방식이라 recorderStatus가 'paused'가 될 일은 없다.
    const connectionLost =
      socketStatus === 'error' ||
      socketStatus === 'unconfigured' ||
      (socketStatus === 'idle' && recorderStatus === 'recording');

    // 소켓만 끊긴 경우든, 새로고침 등으로 recorder 자체가 없어진 경우든 전부 같은 방식으로
    // 복구한다 — 마이크·recorder를 다시 만들고 같은 recordingSessionId로 재연결한다.
    // 사용자가 직접 일시정지한 거라면(recorder도 이때 없앤다) 자동으로 끼어들지 않고
    // 재개를 눌러 isPausedByUser가 false가 될 때까지 기다린다.
    const needsRecovery = (connectionLost || recorderStatus === 'idle') && !isPausedByUser;
    if (!needsRecovery) return;

    if (connectionLost) releaseMicrophone();

    if (recoveryAttempts.current >= RECOVERY_MAX_ATTEMPTS) {
      // 재시도를 다 실패했다 — 더 이어갈 방법이 없으니, 그동안 OPFS에 쌓인 part를
      // 병합·업로드해보고(실패해도 종료 자체는 진행) 정상 종료와 같은 방식으로 회의를 끝낸다.
      if (useRecordingSessionStore.getState().operation === 'idle') {
        setOperation('finishing');
        void (async () => {
          try {
            await uploadPendingRecordingParts(recordingSessionId).catch(() => {});
            await completeRecording.mutateAsync(recordingSessionId);
            disconnect(recordingSessionId);
            clearActiveRecording(recordingSessionId);
          } catch {
            showToast('연결이 끊겨 회의를 자동으로 종료하려 했지만 실패했습니다.', 'danger');
          } finally {
            setOperation('idle');
          }
        })();
      }
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
    clearActiveRecording,
    completeRecording,
    connect,
    disconnect,
    isPausedByUser,
    prepareMicrophone,
    recorderStatus,
    recordingSessionId,
    releaseMicrophone,
    sendAudioChunk,
    setOperation,
    showToast,
    socketStatus,
    startBrowserRecording,
    uploadPendingRecordingParts,
  ]);

  return null;
}
