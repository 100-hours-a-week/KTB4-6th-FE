'use client';

import {
  useCompleteRecording,
  useMediaRecorder,
  useRecordingSessionStore,
  useUploadPendingRecordingParts,
} from '@/features/recording';
import { useRecordingWebSocket } from '@/features/recording-websocket';
import { useAppToast } from '@/shared/ui';

interface UseCompleteRecordingFlowParams {
  recordingSessionId: number | null;
  isCompleted: boolean;
  onCompleted: () => void;
}

export const useCompleteRecordingFlow = ({
  recordingSessionId,
  isCompleted,
  onCompleted,
}: UseCompleteRecordingFlowParams) => {
  const completeRecording = useCompleteRecording();
  const uploadPendingRecordingParts = useUploadPendingRecordingParts();
  const resumeBrowserRecording = useMediaRecorder((state) => state.resume);
  const flushBrowserRecording = useMediaRecorder((state) => state.flush);
  const releaseMicrophone = useMediaRecorder((state) => state.release);
  const clearActiveRecording = useRecordingSessionStore((state) => state.clearActiveRecording);
  const setOperation = useRecordingSessionStore((state) => state.setOperation);
  const { disconnect, isEndedByServer } = useRecordingWebSocket();
  const { showToast } = useAppToast();

  const handleCompleteRecording = async () => {
    if (
      recordingSessionId === null ||
      isCompleted ||
      useRecordingSessionStore.getState().operation !== 'idle'
    ) {
      return;
    }

    setOperation('finishing');
    const recorderStatus = useMediaRecorder.getState().status;
    const wasRecording = recorderStatus === 'recording';
    const isRecorderAlive = recorderStatus === 'recording' || recorderStatus === 'paused';

    if (!isRecorderAlive) {
      releaseMicrophone();
      disconnect(recordingSessionId);
    }

    try {
      const currentUpload = useRecordingSessionStore.getState().pendingUpload;
      const reusableUpload =
        currentUpload?.recordingSessionId === recordingSessionId ? currentUpload : null;

      if (!reusableUpload?.isCompleted) {
        if (isRecorderAlive) await flushBrowserRecording();
        await uploadPendingRecordingParts(recordingSessionId);
      }

      await completeRecording.mutateAsync(recordingSessionId);
    } catch {
      if (isEndedByServer(recordingSessionId)) {
        setOperation('idle');
        return;
      }
      const currentUpload = useRecordingSessionStore.getState().pendingUpload;
      const uploadCompleted =
        currentUpload?.recordingSessionId === recordingSessionId && currentUpload.isCompleted;

      if (!uploadCompleted && wasRecording && useMediaRecorder.getState().status === 'paused') {
        try {
          resumeBrowserRecording();
        } catch {
          showToast('브라우저 녹음을 다시 시작하지 못했습니다.', 'danger');
        }
      }
      showToast(
        uploadCompleted
          ? '회의를 종료하지 못했습니다. 다시 시도해주세요.'
          : '녹음 파일을 업로드하지 못했습니다. 다시 시도해주세요.',
        'danger',
      );
      setOperation('idle');
      return;
    }

    try {
      releaseMicrophone();
    } catch {
      showToast('녹음은 종료됐지만 브라우저 녹음 정리에 실패했습니다.', 'danger');
    } finally {
      disconnect(recordingSessionId);
      clearActiveRecording(recordingSessionId);
      onCompleted();
      setOperation('idle');
    }
  };

  return handleCompleteRecording;
};
