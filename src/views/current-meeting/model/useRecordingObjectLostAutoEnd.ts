'use client';

import { useMediaRecorder } from '@/features/recording';

interface UseRecordingObjectLostAutoEndParams {
  isPreview: boolean;
  isRecorder: boolean;
  /** 서버 기준으로 지금 녹음이 진행 중(RECORDING 또는 PAUSED)인지 */
  isActivelyRecording: boolean;
  isCompleted: boolean;
}

/**
 * 녹음자인데 이 브라우저에 실제 녹음 객체(MediaRecorder)가 없으면(새로고침 등으로 소실)
 * 안내를 띄운다.
 *
 * 실제 재연결·재생성 시도와, 그게 다 실패했을 때 회의를 종료하는 건 RecordingSessionManager가
 * 전역에서 처리한다. 여기서는 그 결과(recorder가 다시 생기거나, isCompleted가 true가 됨)를
 * 기다리는 동안 안내만 보여준다.
 */
export const useRecordingObjectLostAutoEnd = ({
  isPreview,
  isRecorder,
  isActivelyRecording,
  isCompleted,
}: UseRecordingObjectLostAutoEndParams) => {
  const recorder = useMediaRecorder((state) => state.recorder);
  const isOpen =
    !isPreview && !isCompleted && isRecorder && isActivelyRecording && recorder === null;

  return { isOpen };
};
