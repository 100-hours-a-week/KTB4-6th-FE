'use client';

import { useEffect, useState } from 'react';
import { getElapsedRecordingSeconds } from './get-elapsed-recording-seconds';

interface UseElapsedSecondsParams {
  recordingStatus: 'RECORDING' | 'PAUSED' | null;
  startedAt: string | null;
  pausedAt: string | null;
  totalPausedDurationMs: number | null;
}

export const useElapsedSeconds = ({
  recordingStatus,
  startedAt,
  pausedAt,
  totalPausedDurationMs,
}: UseElapsedSecondsParams) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (recordingStatus !== 'RECORDING') return;
    const tick = () => setNow(Date.now());
    const timeout = window.setTimeout(tick, 0); // 바로 갱신
    const interval = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [recordingStatus]);

  return getElapsedRecordingSeconds({
    recordingStatus,
    startedAt,
    pausedAt,
    totalPausedDurationMs,
    now,
  });
};
