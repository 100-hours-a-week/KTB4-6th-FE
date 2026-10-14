import { formatDurationSeconds } from '@/shared/lib';

export interface TargetComparisonRange {
  startDate: string;
  endDate: string;
  targetDurationSeconds: number;
  actualDurationSeconds: number;
}

export interface SelectedRangeSummary {
  range: string;
  detail: string;
  overtime: string | null;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return { month, day, weekday: WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()] };
};

const formatRangeLabel = (startDate: string, endDate: string) => {
  const start = parseDate(startDate);

  if (startDate === endDate) return `${start.month}월 ${start.day}일 (${start.weekday})`;

  const end = parseDate(endDate);
  const endLabel = end.month === start.month ? `${end.day}일` : `${end.month}월 ${end.day}일`;

  return `${start.month}월 ${start.day}일 – ${endLabel}`;
};

export const hasRangeMeetings = (range: TargetComparisonRange) => range.targetDurationSeconds > 0;

export const getDefaultRangeIndex = (ranges: TargetComparisonRange[]) => {
  const lastIndexWithMeetings = ranges.findLastIndex(hasRangeMeetings);
  return lastIndexWithMeetings === -1 ? ranges.length - 1 : lastIndexWithMeetings;
};

export const toSelectedRangeSummary = (range: TargetComparisonRange): SelectedRangeSummary => {
  const rangeLabel = formatRangeLabel(range.startDate, range.endDate);

  if (!hasRangeMeetings(range)) {
    return { range: rangeLabel, detail: '종료된 회의가 없어요', overtime: null };
  }

  const overtimeSeconds = range.actualDurationSeconds - range.targetDurationSeconds;

  return {
    range: rangeLabel,
    detail: `목표 ${formatDurationSeconds(range.targetDurationSeconds)} · 실제 ${formatDurationSeconds(range.actualDurationSeconds)}`,
    overtime: overtimeSeconds > 0 ? `· ${formatDurationSeconds(overtimeSeconds)} 초과` : null,
  };
};
