'use client';

import {
  useMediaRecorder,
  useRecordingSessionStore,
  useUpdateRecordingStatus,
} from '@/features/recording';
import { useRecordingWebSocket } from '@/features/recording-websocket';
import { useAppToast } from '@/shared/ui';

interface UsePauseResumeRecordingFlowParams {
  recordingSessionId: number | null;
  canPauseResumeRecording: boolean;
}

/**
 * 서버 녹음 상태를 먼저 바꾼 뒤 브라우저 쪽을 맞춘다.
 *
 * 일시정지는 녹음 객체(MediaRecorder)와 오디오 웹소켓을 둘 다 없앤다. 재개는 여기서
 * 직접 새로 만들지 않고 isPausedByUser만 false로 돌려놓는다 — RecordingSessionManager가
 * 이 둘이 없어진 걸 보고 마이크·recorder를 새로 만들고 같은 recordingSessionId로
 * 재연결까지 이어받는다 (연결이 끊겼을 때 복구하는 것과 같은 경로).
 */
export const usePauseResumeRecordingFlow = ({
  recordingSessionId,
  canPauseResumeRecording,
}: UsePauseResumeRecordingFlowParams) => {
  const updateRecordingStatus = useUpdateRecordingStatus();
  const releaseMicrophone = useMediaRecorder((state) => state.release);
  const recorderStatus = useMediaRecorder((state) => state.status);
  const setOperation = useRecordingSessionStore((state) => state.setOperation);
  const setIsPausedByUser = useRecordingSessionStore((state) => state.setIsPausedByUser);
  const { disconnect } = useRecordingWebSocket();
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
