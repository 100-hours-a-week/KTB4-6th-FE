'use client';

import { useEffect, useRef } from 'react';
import { useAppToast } from '@/shared/ui';

const TARGET_TIME_REACHED_TOAST_DURATION_MS = 2500;

interface UseTargetTimeReachedNoticeParams {
  elapsedSeconds: number | null;
  targetMinutes: number | null;
  isRecording: boolean;
}

export const useTargetTimeReachedNotice = ({
  elapsedSeconds,
  targetMinutes,
  isRecording,
}: UseTargetTimeReachedNoticeParams) => {
  const { showToast } = useAppToast();
  const previousElapsedSecondsRef = useRef<number | null>(null);
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    if (!isRecording || elapsedSeconds === null || targetMinutes === null) return;

    const targetSeconds = targetMinutes * 60;
    const previousElapsedSeconds = previousElapsedSecondsRef.current;
    previousElapsedSecondsRef.current = elapsedSeconds;

    if (hasNotifiedRef.current || elapsedSeconds < targetSeconds) return;

    hasNotifiedRef.current = true;
    if (previousElapsedSeconds === null || previousElapsedSeconds >= targetSeconds) return;

    showToast(`목표 시간 ${targetMinutes}분이 지났어요. 회의를 마무리해 주세요`, 'warning', {
      timeout: TARGET_TIME_REACHED_TOAST_DURATION_MS,
    });
  }, [elapsedSeconds, isRecording, showToast, targetMinutes]);
};
