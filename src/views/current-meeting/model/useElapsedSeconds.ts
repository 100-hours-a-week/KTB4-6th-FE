'use client';

import { useEffect, useState } from 'react';
import { getElapsedRecordingSeconds } from './get-elapsed-recording-seconds';

interface UseElapsedSecondsParams {
  recordingStatus: 'RECORDING' | 'PAUSED' | null;
  startedAt: string | null;
  pausedAt: string | null;
  totalPausedDurationMs: number | null;
}

/**
 * 녹음 경과 시간(초)을 계산한다. 녹음 중일 때만 1초마다 기준 시각을 갱신해 화면이 실시간으로 흐르게 하고,
 * 일시정지·대기 중에는 갱신을 멈춘다(값은 getElapsedRecordingSeconds가 상태에 맞게 고정해서 돌려준다).
 */
export const useElapsedSeconds = ({
  recordingStatus,
  startedAt,
  pausedAt,
  totalPausedDurationMs,
}: UseElapsedSecondsParams) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (recordingStatus !== 'RECORDING') return;

    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [recordingStatus]);

  return getElapsedRecordingSeconds({
    recordingStatus,
    startedAt,
    pausedAt,
    totalPausedDurationMs,
    now,
  });
};
