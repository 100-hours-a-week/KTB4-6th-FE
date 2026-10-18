'use client';

import {
  useMediaRecorder,
  useRecordingSessionStore,
  useUpdateRecordingStatus,
} from '@/features/recording';
import { useRecordingWebSocket } from '@/features/recording-websocket';
import { useAppToast } from '@/shared/ui';

const PAUSE_AUDIO_SEND_TIMEOUT_MS = 1000;

interface UsePauseResumeRecordingFlowParams {
  recordingSessionId: number | null;
  canPauseResumeRecording: boolean;
}

export const usePauseResumeRecordingFlow = ({
  recordingSessionId,
  canPauseResumeRecording,
}: UsePauseResumeRecordingFlowParams) => {
  const updateRecordingStatus = useUpdateRecordingStatus();
  const flushBrowserRecording = useMediaRecorder((state) => state.flush);
  const resumeBrowserRecording = useMediaRecorder((state) => state.resume);
  const releaseMicrophone = useMediaRecorder((state) => state.release);
  const recorderStatus = useMediaRecorder((state) => state.status);
  const setOperation = useRecordingSessionStore((state) => state.setOperation);
  const setIsPausedByUser = useRecordingSessionStore((state) => state.setIsPausedByUser);
  const { disconnect, waitForAudioSent } = useRecordingWebSocket();
  const { showToast } = useAppToast();

  const handlePauseResumeRecording = async () => {
    if (
      !canPauseResumeRecording ||
      recordingSessionId === null ||
      useRecordingSessionStore.getState().operation !== 'idle'
    )
      return;

    const shouldPause = recorderStatus === 'recording';
    const recorder = useMediaRecorder.getState().recorder;
    if (shouldPause && recorder?.state !== 'recording') {
      showToast('브라우저 녹음 상태를 확인할 수 없습니다.', 'danger');
      return;
    }

    const restoreBrowserRecording = () => {
      if (useMediaRecorder.getState().recorder?.state !== 'paused') return;
      try {
        resumeBrowserRecording();
      } catch {
        showToast('브라우저 녹음을 다시 시작하지 못했습니다.', 'danger');
      }
    };

    setOperation('updating');
    if (shouldPause) {
      try {
        await flushBrowserRecording();
        await waitForAudioSent(recordingSessionId, PAUSE_AUDIO_SEND_TIMEOUT_MS);
      } catch {
        restoreBrowserRecording();
        showToast('브라우저 녹음 상태를 변경하지 못했습니다.', 'danger');
        setOperation('idle');
        return;
      }
    }

    try {
      await updateRecordingStatus.mutateAsync({
        recordingSessionId,
        status: shouldPause ? 'PAUSED' : 'RECORDING',
      });
    } catch {
      if (shouldPause) restoreBrowserRecording();
      showToast('녹음 상태를 변경하지 못했습니다. 다시 시도해주세요.', 'danger');
      setOperation('idle');
      return;
    }

    try {
      if (shouldPause) {
        releaseMicrophone();
        disconnect(recordingSessionId);
        setIsPausedByUser(true);
      } else {
        setIsPausedByUser(false);
      }
    } catch {
      showToast('브라우저 녹음 상태를 변경하지 못했습니다.', 'danger');
    } finally {
      setOperation('idle');
    }
  };

  return handlePauseResumeRecording;
};
