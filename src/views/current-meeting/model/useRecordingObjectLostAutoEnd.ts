'use client';

import { useEffect, useState } from 'react';
import { useCompleteRecording, useMediaRecorder } from '@/features/recording';
import { useAppToast } from '@/shared/ui';

const AUTO_END_COUNTDOWN_SECONDS = 3;

interface UseRecordingObjectLostAutoEndParams {
  isPreview: boolean;
  isRecorder: boolean;
  /** 서버 기준으로 지금 녹음이 진행 중(RECORDING 또는 PAUSED)인지 */
  isActivelyRecording: boolean;
  isCompleted: boolean;
  /** 서버가 알고 있는 녹음 세션 ID. 로컬 녹음 세션이 없어도 종료 요청에 쓴다 */
  recordingSessionId: number | null;
}

/**
 * 녹음자인데 이 브라우저에 실제 녹음 객체(MediaRecorder)가 없으면(새로고침 등으로 소실),
 * 안내와 함께 몇 초 뒤 자동으로 회의를 종료한다. 이어갈 방법이 없는 상태라 취소는 없다.
 */
export const useRecordingObjectLostAutoEnd = ({
  isPreview,
  isRecorder,
  isActivelyRecording,
  isCompleted,
  recordingSessionId,
}: UseRecordingObjectLostAutoEndParams) => {
  const recorder = useMediaRecorder((state) => state.recorder);
  const completeRecording = useCompleteRecording();
  const { showToast } = useAppToast();

  const shouldAutoEnd =
    !isPreview && !isCompleted && isRecorder && isActivelyRecording && recorder === null;

  const [secondsLeft, setSecondsLeft] = useState(AUTO_END_COUNTDOWN_SECONDS);
  const [previousShouldAutoEnd, setPreviousShouldAutoEnd] = useState(shouldAutoEnd);

  // 상태가 새로 감지되면(또는 해소되면) 카운트다운을 처음부터 다시 본다. (렌더링 중 상태 조정)
  if (shouldAutoEnd !== previousShouldAutoEnd) {
    setPreviousShouldAutoEnd(shouldAutoEnd);
    setSecondsLeft(AUTO_END_COUNTDOWN_SECONDS);
  }

  useEffect(() => {
    if (!shouldAutoEnd) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [shouldAutoEnd]);

  useEffect(() => {
    if (!shouldAutoEnd || secondsLeft > 0 || recordingSessionId === null) return;
    if (completeRecording.isPending || completeRecording.isSuccess) return;

    completeRecording.mutate(recordingSessionId, {
      onError: () => showToast('회의를 자동으로 종료하지 못했습니다. 다시 시도해주세요.', 'danger'),
    });
  }, [shouldAutoEnd, secondsLeft, recordingSessionId, completeRecording, showToast]);

  return { isOpen: shouldAutoEnd, secondsLeft };
};
