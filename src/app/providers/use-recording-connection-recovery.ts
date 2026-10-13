'use client';

import { useCallback, useEffect, useEffectEvent, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getCurrentMeetingQueryKey } from '@/features/meeting-sse';
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
import { ensureFreshAuthTokens } from './auth-token-refresh';

const RECOVERY_MAX_ATTEMPTS = 2;
const RECOVERY_RETRY_DELAY_MS = 2000;

interface UseRecordingConnectionRecoveryParams {
  meetingId: number | undefined;
  recordingSessionId: number | undefined;
  socketStatus: RecordingWebSocketStatus | undefined;
}

export const useRecordingConnectionRecovery = ({
  meetingId,
  recordingSessionId,
  socketStatus,
}: UseRecordingConnectionRecoveryParams) => {
  const queryClient = useQueryClient();
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

  const giveUp = useEffectEvent(async (id: number, targetMeetingId: number) => {
    setOperation('finishing');
    try {
      await uploadPendingRecordingParts(id).catch(() => {});
      await completeRecording.mutateAsync(id);
      await queryClient.invalidateQueries({
        queryKey: getCurrentMeetingQueryKey(targetMeetingId),
      });
      disconnect(id);
      clearActiveRecording(id);
    } catch {
      showToast('연결이 끊겨 회의를 자동으로 종료하려 했지만 실패했습니다.', 'danger');
    } finally {
      setOperation('idle');
    }
  });

  const notifyRecordingElsewhere = useEffectEvent(() => {
    showToast('다른 탭이나 기기에서 녹음이 진행되고 있어요');
  });

  useEffect(() => {
    recoveryAttempts.current = 0;
    hasGivenUp.current = false;
  }, [recordingSessionId]);

  useEffect(() => {
    if (recordingSessionId === undefined || meetingId === undefined) return;
    if (socketStatus === 'connected' && recorderStatus === 'ready') return;

    if (socketStatus === 'closed' || socketStatus === 'superseded') {
      if (recorderStatus === 'idle') return;
      releaseMicrophone();
      if (socketStatus === 'superseded') notifyRecordingElsewhere();
      return;
    }

    const connectionLost =
      socketStatus === 'error' ||
      socketStatus === 'unconfigured' ||
      (socketStatus === 'idle' && recorderStatus === 'recording');

    if (isPausedByUser) return;

    if (!connectionLost && recorderStatus === 'ready' && socketStatus !== 'connecting') {
      const { audioFormat } = useMediaRecorder.getState();
      if (audioFormat) connect(recordingSessionId, audioFormat);
      return;
    }

    const needsRecovery = connectionLost || recorderStatus === 'idle';
    if (!needsRecovery) return;

    if (connectionLost) releaseMicrophone();

    if (recoveryAttempts.current >= RECOVERY_MAX_ATTEMPTS) {
      if (!hasGivenUp.current && useRecordingSessionStore.getState().operation === 'idle') {
        hasGivenUp.current = true;
        void giveUp(recordingSessionId, meetingId);
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
            await ensureFreshAuthTokens().catch(() => {});
            if (cancelled) return;
            connect(recordingSessionId, audioFormat);
          } catch {}
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
    meetingId,
    prepareMicrophone,
    recorderStatus,
    recordingSessionId,
    releaseMicrophone,
    socketStatus,
  ]);

  return { resetAttempts };
};
