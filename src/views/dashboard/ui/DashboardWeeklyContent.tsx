'use client';

import {
  addDashboardDays,
  type DashboardData,
  getWeeklyDashboardRange,
} from '@/features/dashboard';
import { toSelectedWeeklyDaySummary, toWeeklyDashboardBars } from '../model/weekly-dashboard-view';
import { DashboardWeeklyComparisonCard } from './DashboardWeeklyComparisonCard';
import { DashboardWeeklyOvertimeChart } from './DashboardWeeklyOvertimeChart';
import { DashboardWeekNavigator } from './DashboardWeekNavigator';

interface DashboardWeeklyContentProps {
  dashboard: DashboardData;
  selectedDate: string;
  today: string;
  minWeekStart: string;
  maxWeekStart: string;
  onDateChange: (date: string) => void;
  onOpenDaily: (date: string) => void;
}

export const DashboardWeeklyContent = ({
  dashboard,
  selectedDate,
  today,
  minWeekStart,
  maxWeekStart,
  onDateChange,
  onOpenDaily,
}: DashboardWeeklyContentProps) => {
  const range = getWeeklyDashboardRange(selectedDate);
  const bars = toWeeklyDashboardBars(dashboard.chart, range, selectedDate, today);
  const selectedBar = bars.find(({ isSelected }) => isSelected) ?? null;
  const selectedDay = selectedBar ? toSelectedWeeklyDaySummary(selectedBar, today) : null;

  const moveWeek = (amount: number) => {
    const nextDate = addDashboardDays(selectedDate, amount * 7);
    onDateChange(nextDate > today ? today : nextDate);
  };

  const selectWeek = (weekStart: string) => {
    const weekEnd = addDashboardDays(weekStart, 6);
    onDateChange(weekEnd > today ? today : weekEnd);
  };

  return (
    <DashboardWeeklyComparisonCard
      totalMeetings={dashboard.summary.totalMeetings}
      totalDurationSeconds={dashboard.summary.totalMeetingDurationSeconds}
      overtimeMeetings={dashboard.summary.overtimeMeetings}
      overtimeRate={dashboard.summary.overtimeMeetingRate}
      selectedDay={selectedDay}
      dateNavigator={
        <DashboardWeekNavigator
          range={range}
          today={today}
          minWeekStart={minWeekStart}
          maxWeekStart={maxWeekStart}
          canMovePrevious={range.from > minWeekStart}
          canMoveNext={range.from < maxWeekStart}
          onSelect={selectWeek}
          onPrevious={() => moveWeek(-1)}
          onNext={() => moveWeek(1)}
        />
      }
      onOpenDaily={() => selectedDay && onOpenDaily(selectedDay.date)}
    >
      <DashboardWeeklyOvertimeChart bars={bars} onSelect={onDateChange} />
    </DashboardWeeklyComparisonCard>
  );
};
