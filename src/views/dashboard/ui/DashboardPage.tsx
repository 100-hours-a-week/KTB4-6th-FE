'use client';

import { useRef, useState } from 'react';
import {
  getDailyDashboardRange,
  getDashboardWeekStart,
  getRecentDashboardDateRange,
  getTodayInKorea,
  getWeeklyDashboardRange,
  useDashboard,
} from '@/features/dashboard';
import { useTeamDetail } from '@/features/team-management';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { DashboardDailyContent } from './DashboardDailyContent';
import { DashboardHeader } from './DashboardHeader';
import { DashboardPeriodTabs, type DashboardPeriod } from './DashboardPeriodTabs';
import { DashboardErrorState, DashboardLoadingState } from './DashboardStates';
import { DashboardSummaryCard } from './DashboardSummaryCard';
import { DashboardTopicsCard } from './DashboardTopicsCard';
import { DashboardWeeklyContent } from './DashboardWeeklyContent';

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

  const handlePeriodChange = (nextPeriod: DashboardPeriod) => {
    setPeriod(nextPeriod);
  };

  const handleOpenDaily = (date: string) => {
    setDailyDate(date);
    setPeriod('daily');
    requestAnimationFrame(() => {
      scrollRootRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-cool-50">
      <DashboardHeader isMenuDisabled={!team} onMenuClick={() => setIsSidebarOpen(true)} />
      <DashboardPeriodTabs value={period} onChange={handlePeriodChange} />

      <div
        ref={scrollRootRef}
        className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-[22px] pt-[18px] pb-8"
      >
        {activeDashboard && summary ? (
          <>
            {period === 'daily' ? (
              <DashboardDailyContent
                dashboard={activeDashboard}
                selectedDate={dailyDate}
                today={today}
                minDate={availableDateRange.min}
                maxDate={availableDateRange.max}
                onDateChange={setDailyDate}
              />
            ) : (
              <DashboardWeeklyContent
                dashboard={activeDashboard}
                selectedDate={weeklyDate}
                today={today}
                minWeekStart={earliestWeekStart}
                maxWeekStart={currentWeekRange.from}
                onDateChange={setWeeklyDate}
                onOpenDaily={handleOpenDaily}
              />
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
