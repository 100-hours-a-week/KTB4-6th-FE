'use client';

import { useRef, useState } from 'react';
import {
  addDashboardDays,
  getDailyDashboardRange,
  getDashboardWeekStart,
  getRecentDashboardDateRange,
  getTodayInKorea,
  getWeeklyDashboardRange,
  useDashboard,
} from '@/features/dashboard';
import { useTeamDetail } from '@/features/team-management';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { toSelectedMeetingSummary } from '../model/target-comparison-view';
import { toSelectedWeeklyDaySummary, toWeeklyDashboardBars } from '../model/weekly-dashboard-view';
import { DashboardDateNavigator } from './DashboardDateNavigator';
import { DashboardHeader } from './DashboardHeader';
import { DashboardPeriodTabs, type DashboardPeriod } from './DashboardPeriodTabs';
import { DashboardErrorState, DashboardLoadingState } from './DashboardStates';
import { DashboardSummaryCard } from './DashboardSummaryCard';
import { DashboardTargetComparisonCard } from './DashboardTargetComparisonCard';
import { DashboardTargetComparisonChart } from './DashboardTargetComparisonChart';
import { DashboardTopicsCard } from './DashboardTopicsCard';
import { DashboardWeeklyComparisonCard } from './DashboardWeeklyComparisonCard';
import { DashboardWeeklyOvertimeChart } from './DashboardWeeklyOvertimeChart';
import { DashboardWeekNavigator } from './DashboardWeekNavigator';

interface DashboardPageProps {
  teamId: number;
}

export const DashboardPage = ({ teamId }: DashboardPageProps) => {
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [period, setPeriod] = useState<DashboardPeriod>('daily');
  const [today] = useState(getTodayInKorea);
  const [dailyDate, setDailyDate] = useState(today);
  const [weeklyDate, setWeeklyDate] = useState(today);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const availableDateRange = getRecentDashboardDateRange(today);
  const selectedWeekRange = getWeeklyDashboardRange(weeklyDate);
  const currentWeekRange = getWeeklyDashboardRange(today);
  const earliestWeekStart = getDashboardWeekStart(availableDateRange.min);
  const dashboardRange = period === 'daily' ? getDailyDashboardRange(dailyDate) : selectedWeekRange;
  const { data: team } = useTeamDetail(teamId);
  const {
    data: dashboard,
    isPending: isDashboardPending,
    isFetching: isDashboardFetching,
    refetch: refetchDashboard,
  } = useDashboard(teamId, dashboardRange);
  const expectedPeriodDays = period === 'daily' ? 1 : 7;
  const activeDashboard = dashboard?.periodDays === expectedPeriodDays ? dashboard : null;
  const summary = activeDashboard?.summary ?? null;
  const defaultMeetingId = activeDashboard?.meetings.at(-1)?.meetingId ?? null;
  const activeMeetingId =
    period === 'daily' &&
    activeDashboard?.meetings.some(({ meetingId }) => meetingId === selectedMeetingId)
      ? selectedMeetingId
      : defaultMeetingId;
  const selectedMeeting =
    period === 'daily'
      ? (activeDashboard?.meetings.find(({ meetingId }) => meetingId === activeMeetingId) ?? null)
      : null;
  const selectedMeetingSummary = selectedMeeting ? toSelectedMeetingSummary(selectedMeeting) : null;
  const weeklyBars =
    period === 'weekly' && activeDashboard
      ? toWeeklyDashboardBars(activeDashboard.chart, selectedWeekRange, weeklyDate, today)
      : [];
  const selectedWeeklyBar = weeklyBars.find(({ isSelected }) => isSelected) ?? null;
  const selectedWeeklyDay = selectedWeeklyBar
    ? toSelectedWeeklyDaySummary(selectedWeeklyBar, today)
    : null;

  const handleDailyDateSelect = (date: string) => {
    setDailyDate(date);
    setSelectedMeetingId(null);
  };

  const handlePeriodChange = (nextPeriod: DashboardPeriod) => {
    setPeriod(nextPeriod);
    setSelectedMeetingId(null);
  };

  const moveWeek = (amount: number) => {
    const nextDate = addDashboardDays(weeklyDate, amount * 7);
    setWeeklyDate(nextDate > today ? today : nextDate);
  };

  const handleWeekSelect = (weekStart: string) => {
    const weekEnd = addDashboardDays(weekStart, 6);
    setWeeklyDate(weekEnd > today ? today : weekEnd);
  };

  const handleOpenDaily = () => {
    if (selectedWeeklyDay) setDailyDate(selectedWeeklyDay.date);
    setSelectedMeetingId(null);
    setPeriod('daily');
    requestAnimationFrame(() => {
      scrollRootRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  return (
    <div className="flex h-dvh min-h-[844px] flex-col bg-cool-50">
      <DashboardHeader isMenuDisabled={!team} onMenuClick={() => setIsSidebarOpen(true)} />
      <DashboardPeriodTabs value={period} onChange={handlePeriodChange} />

      <div
        ref={scrollRootRef}
        className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-[22px] pt-[18px] pb-8"
      >
        {activeDashboard && summary ? (
          <>
            {period === 'daily' ? (
              <DashboardTargetComparisonCard
                totalMeetings={summary.totalMeetings}
                totalDurationSeconds={summary.totalMeetingDurationSeconds}
                selectedMeetingSummary={selectedMeetingSummary}
                dateNavigator={
                  <DashboardDateNavigator
                    selectedDate={dailyDate}
                    today={today}
                    minDate={availableDateRange.min}
                    maxDate={availableDateRange.max}
                    onSelect={handleDailyDateSelect}
                    onPrevious={() => handleDailyDateSelect(addDashboardDays(dailyDate, -1))}
                    onNext={() => handleDailyDateSelect(addDashboardDays(dailyDate, 1))}
                  />
                }
              >
                <DashboardTargetComparisonChart
                  meetings={activeDashboard.meetings}
                  selectedMeetingId={activeMeetingId}
                  onSelect={setSelectedMeetingId}
                />
              </DashboardTargetComparisonCard>
            ) : (
              <DashboardWeeklyComparisonCard
                totalMeetings={summary.totalMeetings}
                totalDurationSeconds={summary.totalMeetingDurationSeconds}
                overtimeMeetings={summary.overtimeMeetings}
                overtimeRate={summary.overtimeMeetingRate}
                selectedDay={selectedWeeklyDay}
                dateNavigator={
                  <DashboardWeekNavigator
                    range={selectedWeekRange}
                    today={today}
                    minWeekStart={earliestWeekStart}
                    maxWeekStart={currentWeekRange.from}
                    canMovePrevious={selectedWeekRange.from > earliestWeekStart}
                    canMoveNext={selectedWeekRange.from < currentWeekRange.from}
                    onSelect={handleWeekSelect}
                    onPrevious={() => moveWeek(-1)}
                    onNext={() => moveWeek(1)}
                  />
                }
                onOpenDaily={handleOpenDaily}
              >
                <DashboardWeeklyOvertimeChart bars={weeklyBars} onSelect={setWeeklyDate} />
              </DashboardWeeklyComparisonCard>
            )}

            <DashboardSummaryCard
              period={period}
              totalMeetings={summary.totalMeetings}
              totalDurationSeconds={summary.totalMeetingDurationSeconds}
              averageDurationSeconds={summary.averageMeetingDurationSeconds}
              overtimeMeetings={summary.overtimeMeetings}
              contextOutSeconds={summary.totalContextOutSeconds}
              contextOutRate={summary.contextOutRate}
            />
            <DashboardTopicsCard topics={activeDashboard.topics} />
          </>
        ) : isDashboardPending ? (
          <DashboardLoadingState />
        ) : (
          <DashboardErrorState
            isRetrying={isDashboardFetching}
            onRetry={() => void refetchDashboard()}
          />
        )}
      </div>

      {team && (
        <NavigationSidebar
          isOpen={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          teamId={teamId}
          teamName={team.name}
        />
      )}
    </div>
  );
};
