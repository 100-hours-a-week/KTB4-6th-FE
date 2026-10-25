'use client';

import {
  isInsufficientCreditError,
  isUnsupportedRecordingBrowserError,
  useMediaRecorder,
  useRecordingSessionStore,
  useStartRecording,
} from '@/features/recording';
import { useRecordingWebSocket } from '@/features/recording-websocket';
import { useAppToast } from '@/shared/ui';

const getMicrophoneErrorMessage = (error: unknown) => {
  if (isUnsupportedRecordingBrowserError(error)) {
    return '이 브라우저에서는 녹음할 수 없습니다. 최신 버전의 Chrome 또는 Safari에서 다시 시도해주세요.';
  }
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return '마이크 권한이 없어 녹음을 진행할 수 없습니다. 마이크 권한을 다시 설정해주세요.';
  }
  return '마이크를 사용할 수 없습니다. 장치와 브라우저 권한을 확인해주세요.';
};

interface UseStartRecordingFlowParams {
  teamId: string;
  meetingId: number;
  isWaiting: boolean;
  isRecordingAcknowledged: boolean;
  onRecordingStarted: () => void;
  onInsufficientCredit: () => void;
}

export const useStartRecordingFlow = ({
  teamId,
  meetingId,
  isWaiting,
  isRecordingAcknowledged,
  onRecordingStarted,
  onInsufficientCredit,
}: UseStartRecordingFlowParams) => {
  const startRecording = useStartRecording();
  const prepareMicrophone = useMediaRecorder((state) => state.prepare);
  const releaseMicrophone = useMediaRecorder((state) => state.release);
  const setActiveRecording = useRecordingSessionStore((state) => state.setActiveRecording);
  const setOperation = useRecordingSessionStore((state) => state.setOperation);
  const { connect } = useRecordingWebSocket();
  const { showToast } = useAppToast();

  const handleConfirmRecording = async () => {
    if (
      !isWaiting ||
      useRecordingSessionStore.getState().activeRecording !== null ||
      !isRecordingAcknowledged ||
      useRecordingSessionStore.getState().operation !== 'idle'
    ) {
      return;
    }

    setOperation('starting');
    try {
      const audioFormat = await prepareMicrophone();

      try {
        const startedSessionId = await startRecording.mutateAsync(meetingId);
        setActiveRecording({
          teamId,
          meetingId,
          recordingSessionId: startedSessionId,
          startedAt: Date.now(),
        });
        connect(startedSessionId, audioFormat);
        onRecordingStarted();
      } catch (error) {
        releaseMicrophone();
        if (isInsufficientCreditError(error)) {
          onInsufficientCredit();
        } else {
          showToast('녹음을 시작하지 못했습니다. 다시 시도해주세요.', 'danger');
        }
      }
    } catch (error) {
      showToast(getMicrophoneErrorMessage(error), 'danger');
    } finally {
      setOperation('idle');
    }
  };

  return handleConfirmRecording;
};
