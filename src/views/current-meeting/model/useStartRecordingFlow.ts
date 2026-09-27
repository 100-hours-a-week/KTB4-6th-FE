'use client';

import {
  isInsufficientCreditError,
  useMediaRecorder,
  useRecordingSessionStore,
  useStartRecording,
} from '@/features/recording';
import { useRecordingWebSocket } from '@/features/recording-websocket';
import { useAppToast } from '@/shared/ui';

interface UseStartRecordingFlowParams {
  teamId: string;
  meetingId: number;
  isWaiting: boolean;
  isPreview: boolean;
  isRecordingAcknowledged: boolean;
  onRecordingStarted: () => void;
  onInsufficientCredit: () => void;
}

/**
 * 마이크 준비 → 녹음 시작 요청 → 녹음 세션 저장 → 오디오 소켓 연결 순서로 녹음을 시작한다.
 * 크레딧 부족으로 실패하면 토스트 대신 onInsufficientCredit으로 알린다.
 */
export const useStartRecordingFlow = ({
  teamId,
  meetingId,
  isWaiting,
  isPreview,
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
      useRecordingSessionStore.getState().operation !== 'idle' ||
      isPreview
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
      const message =
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? '마이크 권한이 없어 녹음을 진행할 수 없습니다. 마이크 권한을 다시 설정해주세요.'
          : '마이크를 사용할 수 없습니다. 장치와 브라우저 권한을 확인해주세요.';
      showToast(message, 'danger');
    } finally {
      setOperation('idle');
    }
  };

  return handleConfirmRecording;
};
