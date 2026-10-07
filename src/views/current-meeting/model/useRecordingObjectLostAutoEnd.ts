'use client';

import { useMediaRecorder, useRecordingSessionStore } from '@/features/recording';
import { useRecordingWebSocket } from '@/features/recording-websocket';

interface UseRecordingObjectLostAutoEndParams {
  isPreview: boolean;
  isRecorder: boolean;
  /** 서버 기준으로 지금 녹음이 진행 중(RECORDING 또는 PAUSED)인지 */
  isActivelyRecording: boolean;
  isCompleted: boolean;
  /** 사용자가 직접 일시정지해서 recorder가 없는 상태인지 */
  isPausedByUser: boolean;
}

export const useRecordingObjectLostAutoEnd = ({
  isPreview,
  isRecorder,
  isActivelyRecording,
  isCompleted,
  isPausedByUser,
}: UseRecordingObjectLostAutoEndParams) => {
  const recorder = useMediaRecorder((state) => state.recorder);
  const recordingSessionId = useRecordingSessionStore(
    (state) => state.activeRecording?.recordingSessionId,
  );
  const isResumingStream = useRecordingSessionStore((state) => state.isResumingStream);
  const { statuses } = useRecordingWebSocket();
  // 다른 탭·기기가 녹음을 가져간 거라면 이 탭의 녹음 객체가 없는 게 정상이다.
  const isRecordingElsewhere =
    recordingSessionId !== undefined && statuses[recordingSessionId] === 'superseded';
  const isOpen =
    !isPreview &&
    !isCompleted &&
    isRecorder &&
    isActivelyRecording &&
    recorder === null &&
    !isPausedByUser &&
    !isRecordingElsewhere;

  const isResumingOpen =
    !isPreview && !isCompleted && isRecorder && isActivelyRecording && isResumingStream;

  return { isOpen: isOpen || isResumingOpen, isResuming: isResumingOpen };
};
