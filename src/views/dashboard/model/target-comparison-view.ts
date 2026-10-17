import { formatDurationSeconds } from '@/shared/lib';

export interface TargetComparisonRange {
  startDate: string;
  endDate: string;
  targetDurationSeconds: number;
  actualDurationSeconds: number;
}

export interface TargetComparisonBar {
  label: string;
  rangeLabel: string;
  rate: number | null;
  isSelected: boolean;
}

export interface SelectedRangeSummary {
  range: string;
  detail: string;
  overtime: string | null;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MIN_AXIS_RATE = 20;
const RATE_LABEL_MIN_DIFF = 10;

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

const formatAxisLabel = (range: TargetComparisonRange, isLast: boolean) => {
  const start = parseDate(range.startDate);

  if (range.startDate !== range.endDate) return `${start.month}/${start.day}`;
  return isLast ? '오늘' : start.weekday;
};

export const hasRangeMeetings = (range: TargetComparisonRange) => range.targetDurationSeconds > 0;

export const getTargetDeviationRate = (range: TargetComparisonRange) => {
  if (!hasRangeMeetings(range)) return null;

  const overtimeSeconds = range.actualDurationSeconds - range.targetDurationSeconds;
  return Math.round((overtimeSeconds / range.targetDurationSeconds) * 100);
};

export const getTargetDeviationDomain = (rates: (number | null)[]): [number, number] => {
  const maxOverRate = Math.max(MIN_AXIS_RATE, ...rates.map((rate) => rate ?? 0));
  const maxUnderRate = Math.max(MIN_AXIS_RATE, ...rates.map((rate) => -(rate ?? 0)));

  return [-maxUnderRate, maxOverRate];
};

export const toTargetComparisonBars = (
  ranges: TargetComparisonRange[],
  selectedIndex: number,
): TargetComparisonBar[] =>
  ranges.map((range, index) => ({
    label: formatAxisLabel(range, index === ranges.length - 1),
    rangeLabel: formatRangeLabel(range.startDate, range.endDate),
    rate: getTargetDeviationRate(range),
    isSelected: index === selectedIndex,
  }));

export const formatTargetRate = (rate: number | null) => {
  if (rate === null) return '–';
  if (rate === 0) return '0%';
  return rate > 0 ? `+${rate}%` : `−${-rate}%`;
};

export const formatTargetRateTick = (rate: number) =>
  rate === 0 ? '목표' : formatTargetRate(rate);

export const isRateLabelVisible = ({ rate, isSelected }: TargetComparisonBar) =>
  isSelected || rate === null || rate === 0 || Math.abs(rate) >= RATE_LABEL_MIN_DIFF;

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
