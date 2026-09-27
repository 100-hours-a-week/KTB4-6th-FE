'use client';

import {
  useMediaRecorder,
  useRecordingSessionStore,
  useUpdateRecordingStatus,
} from '@/features/recording';
import { useAppToast } from '@/shared/ui';

interface UsePauseResumeRecordingFlowParams {
  recordingSessionId: number | null;
  canPauseResumeRecording: boolean;
}

/** 서버 녹음 상태를 먼저 바꾼 뒤 브라우저 녹음을 일시정지하거나 재개한다. */
export const usePauseResumeRecordingFlow = ({
  recordingSessionId,
  canPauseResumeRecording,
}: UsePauseResumeRecordingFlowParams) => {
  const updateRecordingStatus = useUpdateRecordingStatus();
  const pauseBrowserRecording = useMediaRecorder((state) => state.pause);
  const resumeBrowserRecording = useMediaRecorder((state) => state.resume);
  const recorderStatus = useMediaRecorder((state) => state.status);
  const setOperation = useRecordingSessionStore((state) => state.setOperation);
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
    if (recorder?.state !== (shouldPause ? 'recording' : 'paused')) {
      showToast('브라우저 녹음 상태를 확인할 수 없습니다.', 'danger');
      return;
    }

    setOperation('updating');
    try {
      await updateRecordingStatus.mutateAsync({
        recordingSessionId,
        status: shouldPause ? 'PAUSED' : 'RECORDING',
      });
    } catch {
      showToast('녹음 상태를 변경하지 못했습니다. 다시 시도해주세요.', 'danger');
      setOperation('idle');
      return;
    }

    try {
      if (shouldPause) pauseBrowserRecording();
      else resumeBrowserRecording();
    } catch {
      showToast('브라우저 녹음 상태를 변경하지 못했습니다.', 'danger');
    } finally {
      setOperation('idle');
    }
  };

  return handlePauseResumeRecording;
};
