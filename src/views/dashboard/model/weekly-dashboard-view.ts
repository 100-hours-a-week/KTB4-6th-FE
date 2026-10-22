import {
  addDashboardDays,
  type DashboardChartPointData,
  type DashboardDateRange,
} from '@/features/dashboard';
import { formatDurationSeconds } from '@/shared/lib';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export interface WeeklyDashboardBar {
  date: string;
  label: string;
  meetingCount: number;
  overtimeMeetings: number;
  overtimeRate: number;
  totalDurationSeconds: number;
  averageDurationSeconds: number;
  isSelected: boolean;
  isFuture: boolean;
}

export interface SelectedWeeklyDaySummary {
  date: string;
  dateLabel: string;
  totalDuration: string;
  averageDuration: string;
}

const parseDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const formatDashboardWeekRange = ({ from, to }: DashboardDateRange) => {
  const start = parseDate(from);
  const end = parseDate(to);
  const startLabel = `${start.getUTCMonth() + 1}월 ${start.getUTCDate()}일`;
  const endLabel =
    start.getUTCMonth() === end.getUTCMonth()
      ? `${end.getUTCDate()}일`
      : `${end.getUTCMonth() + 1}월 ${end.getUTCDate()}일`;

  return `${startLabel} – ${endLabel}`;
};

export const toWeeklyDashboardBars = (
  chart: DashboardChartPointData[],
  range: DashboardDateRange,
  selectedDate: string,
  today: string,
): WeeklyDashboardBar[] => {
  const pointsByDate = new Map(chart.map((point) => [point.startDate, point]));

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDashboardDays(range.from, index);
    const point = pointsByDate.get(date);
    const meetingCount = point?.meetingCount ?? 0;
    const totalDurationSeconds = point?.actualDurationSeconds ?? 0;

    return {
      date,
      label: WEEKDAYS[parseDate(date).getUTCDay()],
      meetingCount,
      overtimeMeetings: point?.overtimeMeetings ?? 0,
      overtimeRate:
        meetingCount > 0 ? Math.round(((point?.overtimeMeetings ?? 0) / meetingCount) * 100) : 0,
      totalDurationSeconds,
      averageDurationSeconds: meetingCount > 0 ? totalDurationSeconds / meetingCount : 0,
      isSelected: date === selectedDate,
      isFuture: date > today,
    };
  });
};

export const toSelectedWeeklyDaySummary = (
  bar: WeeklyDashboardBar,
  today: string,
): SelectedWeeklyDaySummary => {
  const date = parseDate(bar.date);
  const dateLabel = `${date.getUTCMonth() + 1}월 ${date.getUTCDate()}일 (${bar.label})${bar.date === today ? ' · 오늘' : ''}`;

  return {
    date: bar.date,
    dateLabel,
    totalDuration: bar.meetingCount > 0 ? formatDurationSeconds(bar.totalDurationSeconds) : '–',
    averageDuration: bar.meetingCount > 0 ? formatDurationSeconds(bar.averageDurationSeconds) : '–',
  };
};
