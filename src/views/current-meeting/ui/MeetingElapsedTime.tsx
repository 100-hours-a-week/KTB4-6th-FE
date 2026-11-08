'use client';

import { AlarmClock } from 'lucide-react';
import { cn } from '@/shared/lib';
import { useCurrentMeetingContext } from '../model/current-meeting-context';
import { useElapsedSeconds } from '../model/useElapsedSeconds';
import { useTargetTimeReachedNotice } from '../model/useTargetTimeReachedNotice';

const formatElapsed = (seconds: number) =>
  [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');

export const MeetingElapsedTime = () => {
  const { recording } = useCurrentMeetingContext();
  const { meeting, isCompleted, isServerCompleted } = recording;
  const elapsedSeconds = useElapsedSeconds({
    recordingStatus:
      meeting.recordingStatus === 'recording'
        ? 'RECORDING'
        : meeting.recordingStatus === 'paused'
          ? 'PAUSED'
          : null,
    startedAt: meeting.recordingStartedAt,
    pausedAt: meeting.recordingPausedAt,
    totalPausedDurationMs: meeting.recordingTotalPausedDurationMs,
  });
  const isOvertime = elapsedSeconds >= meeting.targetMinutes * 60;
  useTargetTimeReachedNotice({
    elapsedSeconds,
    targetMinutes: meeting.targetMinutes,
    isRecording: meeting.recordingStatus === 'recording' && !isCompleted && !isServerCompleted,
  });

  return (
    <span
      className={cn(
        'flex items-center gap-1 font-mono text-xs font-semibold whitespace-nowrap tabular-nums',
        isOvertime
          ? 'rounded-md bg-amber-50 px-1.5 py-0.5 text-amber-700 ring-1 ring-amber-200'
          : 'text-cool-600',
      )}
    >
      {isOvertime && (
        <AlarmClock aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2.2} />
      )}
      {formatElapsed(elapsedSeconds)} / {meeting.targetMinutes}분
      {isOvertime && <span className="font-sans">초과</span>}
    </span>
  );
};
