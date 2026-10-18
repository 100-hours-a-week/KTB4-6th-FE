import type { DashboardMeetingData } from '@/features/dashboard';
import { formatDurationSeconds } from '@/shared/lib';

export interface TargetComparisonBar extends DashboardMeetingData {
  differenceMinutes: number;
  isSelected: boolean;
}

export interface SelectedMeetingSummary {
  title: string;
  detail: string;
  difference: string;
  differenceType: 'over' | 'under' | 'same';
}

const MIN_AXIS_MINUTES = 10;

const roundAxisMinutes = (minutes: number, step: number) =>
  Math.max(MIN_AXIS_MINUTES, Math.ceil(minutes / step) * step);

export const toTargetComparisonBars = (
  meetings: DashboardMeetingData[],
  selectedMeetingId: number | null,
): TargetComparisonBar[] =>
  meetings.map((meeting) => ({
    ...meeting,
    differenceMinutes: (meeting.actualDurationSeconds - meeting.targetDurationSeconds) / 60,
    isSelected: meeting.meetingId === selectedMeetingId,
  }));

export const getTargetDifferenceScale = (
  differences: number[],
): { domain: [number, number]; ticks: number[] } => {
  const largestOvertime = Math.max(0, ...differences);
  const largestReduction = Math.max(0, ...differences.map((difference) => -difference));
  const roughTotal = largestOvertime + largestReduction;
  const step = roughTotal > 60 ? 20 : 10;
  const max = roundAxisMinutes(largestOvertime, step);
  const min = -roundAxisMinutes(largestReduction, step);
  const ticks = [min, 0, max];

  for (let value = -step; value > min; value -= step) ticks.push(value);
  for (let value = step; value < max; value += step) ticks.push(value);

  return { domain: [min, max], ticks: [...new Set(ticks)].sort((a, b) => a - b) };
};

export const formatTargetDifferenceTick = (minutes: number) => {
  if (minutes === 0) return '목표';
  return minutes > 0 ? `+${minutes}분` : `−${Math.abs(minutes)}분`;
};

export const toSelectedMeetingSummary = (meeting: DashboardMeetingData): SelectedMeetingSummary => {
  const differenceSeconds = meeting.actualDurationSeconds - meeting.targetDurationSeconds;

  return {
    title: meeting.title,
    detail: `목표 ${formatDurationSeconds(meeting.targetDurationSeconds)} · 실제 ${formatDurationSeconds(meeting.actualDurationSeconds)}`,
    difference:
      differenceSeconds > 0
        ? `+${formatDurationSeconds(differenceSeconds)} 초과`
        : differenceSeconds < 0
          ? `${formatDurationSeconds(-differenceSeconds)} 단축`
          : '목표와 같음',
    differenceType: differenceSeconds > 0 ? 'over' : differenceSeconds < 0 ? 'under' : 'same',
  };
};
