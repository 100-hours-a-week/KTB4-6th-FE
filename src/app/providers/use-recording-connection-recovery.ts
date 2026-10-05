'use client';

import { useCallback, useEffect, useEffectEvent, useRef } from 'react';
import {
  useCompleteRecording,
  useMediaRecorder,
  useRecordingSessionStore,
  useUploadPendingRecordingParts,
} from '@/features/recording';
import {
  useRecordingWebSocket,
  type RecordingWebSocketStatus,
} from '@/features/recording-websocket';
import { useAppToast } from '@/shared/ui';

const RECOVERY_MAX_ATTEMPTS = 2;
const RECOVERY_RETRY_DELAY_MS = 2000;

interface UseRecordingConnectionRecoveryParams {
  recordingSessionId: number | undefined;
  socketStatus: RecordingWebSocketStatus | undefined;
}

/**
 * 소켓이 끊기거나 녹음 객체가 없어지면 마이크·녹음 객체를 다시 만들고 재연결한다.
 * 재시도를 다 실패하면 로컬 녹음을 업로드하고 회의를 자동 종료한다.
 */
export const useRecordingConnectionRecovery = ({
  recordingSessionId,
  socketStatus,
}: UseRecordingConnectionRecoveryParams) => {
  const isPausedByUser = useRecordingSessionStore((state) => state.isPausedByUser);
  const setOperation = useRecordingSessionStore((state) => state.setOperation);
  const clearActiveRecording = useRecordingSessionStore((state) => state.clearActiveRecording);
  const recorderStatus = useMediaRecorder((state) => state.status);
  const prepareMicrophone = useMediaRecorder((state) => state.prepare);
  const releaseMicrophone = useMediaRecorder((state) => state.release);
  const uploadPendingRecordingParts = useUploadPendingRecordingParts();
  const completeRecording = useCompleteRecording();
  const { connect, disconnect } = useRecordingWebSocket();
  const { showToast } = useAppToast();
  const recoveryAttempts = useRef(0);
  const hasGivenUp = useRef(false);

  const resetAttempts = useCallback(() => {
    recoveryAttempts.current = 0;
  }, []);

  // 재시도를 다 실패했다 — 로컬에 쌓인 녹음을 업로드해보고(실패해도 종료는 진행) 회의를 끝낸다.
  // 종료 요청까지 실패해도 다시 시도하지 않는다 — 같은 요청을 계속 반복하지 않기 위해서다.
  const giveUp = useEffectEvent(async (id: number) => {
    setOperation('finishing');
    try {
      await uploadPendingRecordingParts(id).catch(() => {});
      await completeRecording.mutateAsync(id);
      disconnect(id);
      clearActiveRecording(id);
    } catch {
      showToast('연결이 끊겨 회의를 자동으로 종료하려 했지만 실패했습니다.', 'danger');
    } finally {
      setOperation('idle');
    }
  });

  // 녹음 세션이 바뀌면(새로 시작했거나 종료됐거나) 이전 세션의 재시도 기록은 버린다.
  useEffect(() => {
    recoveryAttempts.current = 0;
    hasGivenUp.current = false;
  }, [recordingSessionId]);

  useEffect(() => {
    if (recordingSessionId === undefined) return;
    // 연결됐고 녹음 객체도 준비됐으면 녹음 시작은 useRecordingStreamStart가 맡는다.
    if (socketStatus === 'connected' && recorderStatus === 'ready') return;

    // 일시정지는 recorder를 없애는 방식이라 recorderStatus가 'paused'가 될 일은 없다.
    const connectionLost =
      socketStatus === 'error' ||
      socketStatus === 'unconfigured' ||
      (socketStatus === 'idle' && recorderStatus === 'recording');

    // 사용자가 직접 일시정지했다면 재개를 눌러 isPausedByUser가 false가 될 때까지 기다린다.
    if (isPausedByUser) return;

    // recorder는 준비됐는데 소켓이 아직 없는 상태면 연결만 하면 된다.
    if (!connectionLost && recorderStatus === 'ready' && socketStatus !== 'connecting') {
      const { audioFormat } = useMediaRecorder.getState();
      if (audioFormat) connect(recordingSessionId, audioFormat);
      return;
    }

    // 소켓만 끊긴 경우든, 새로고침 등으로 recorder가 없어진 경우든 마이크·recorder를 다시 만들고 재연결한다.
    const needsRecovery = connectionLost || recorderStatus === 'idle';
    if (!needsRecovery) return;

    if (connectionLost) releaseMicrophone();

    if (recoveryAttempts.current >= RECOVERY_MAX_ATTEMPTS) {
      if (!hasGivenUp.current && useRecordingSessionStore.getState().operation === 'idle') {
        hasGivenUp.current = true;
        void giveUp(recordingSessionId);
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
    connect,
    isPausedByUser,
    prepareMicrophone,
    recorderStatus,
    recordingSessionId,
    releaseMicrophone,
    socketStatus,
  ]);

  return { resetAttempts };
};
