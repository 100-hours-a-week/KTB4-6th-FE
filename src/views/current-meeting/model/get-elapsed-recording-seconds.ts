import { parseServerDate } from '@/shared/lib';

interface GetElapsedRecordingSecondsInput {
  recordingStatus: 'RECORDING' | 'PAUSED' | null;
  startedAt: string | null;
  pausedAt: string | null;
  totalPausedDurationMs: number | null;
  /** 기준 시각(ms). 녹음 중이면 이 시각까지 흐른 시간을 계산한다. */
  now: number;
}

/**
 * 녹음이 시작된 뒤 일시정지 시간을 뺀 실제 진행 시간(초)을 계산한다.
 * 일시정지 중이면 일시정지한 시각까지의 값으로 멈춰서 돌려주고, 녹음 중이 아니면(대기 중 등) 0이다.
 */
export const getElapsedRecordingSeconds = ({
  recordingStatus,
  startedAt,
  pausedAt,
  totalPausedDurationMs,
  now,
}: GetElapsedRecordingSecondsInput): number => {
  if (!startedAt || recordingStatus === null) return 0;

  const referenceTime =
    recordingStatus === 'PAUSED' && pausedAt ? parseServerDate(pausedAt).getTime() : now;
  const elapsedMs =
    referenceTime - parseServerDate(startedAt).getTime() - (totalPausedDurationMs ?? 0);

  return Math.max(0, Math.floor(elapsedMs / 1000));
};
