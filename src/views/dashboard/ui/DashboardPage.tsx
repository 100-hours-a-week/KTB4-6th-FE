'use client';

import { useState } from 'react';
import {
  addDashboardDays,
  getDailyDashboardRange,
  getRecentDashboardDateRange,
  getTodayInKorea,
  useDashboard,
} from '@/features/dashboard';
import { useTeamDetail } from '@/features/team-management';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { toSelectedMeetingSummary } from '../model/target-comparison-view';
import { DashboardDateNavigator } from './DashboardDateNavigator';
import { DashboardHeader } from './DashboardHeader';
import { DashboardPeriodTabs } from './DashboardPeriodTabs';
import { DashboardErrorState, DashboardLoadingState } from './DashboardStates';
import { DashboardSummaryCard } from './DashboardSummaryCard';
import { DashboardTargetComparisonCard } from './DashboardTargetComparisonCard';
import { DashboardTargetComparisonChart } from './DashboardTargetComparisonChart';
import { DashboardTopicsCard } from './DashboardTopicsCard';

interface DashboardPageProps {
  teamId: number;
}

export const DashboardPage = ({ teamId }: DashboardPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [today] = useState(getTodayInKorea);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const availableDateRange = getRecentDashboardDateRange(today);
  const { data: team } = useTeamDetail(teamId);
  const {
    data: dashboard,
    isPending: isDashboardPending,
    isFetching: isDashboardFetching,
    refetch: refetchDashboard,
  } = useDashboard(teamId, getDailyDashboardRange(selectedDate));
  const dailyDashboard = dashboard?.periodDays === 1 ? dashboard : null;
  const summary = dailyDashboard?.summary ?? null;
  const selectedMeeting =
    dailyDashboard?.meetings.find(({ meetingId }) => meetingId === selectedMeetingId) ?? null;
  const selectedMeetingSummary = selectedMeeting ? toSelectedMeetingSummary(selectedMeeting) : null;

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedMeetingId(null);
  };

  return (
    <div className="flex h-dvh min-h-[844px] flex-col bg-cool-50">
      <DashboardHeader isMenuDisabled={!team} onMenuClick={() => setIsSidebarOpen(true)} />
      <DashboardPeriodTabs />

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-[22px] pt-[18px] pb-8">
        {dailyDashboard && summary ? (
          <>
            <DashboardTargetComparisonCard
              totalMeetings={summary.totalMeetings}
              totalDurationSeconds={summary.totalMeetingDurationSeconds}
              selectedMeetingSummary={selectedMeetingSummary}
              dateNavigator={
                <DashboardDateNavigator
                  selectedDate={selectedDate}
                  today={today}
                  minDate={availableDateRange.min}
                  maxDate={availableDateRange.max}
                  onSelect={handleDateSelect}
                  onPrevious={() => handleDateSelect(addDashboardDays(selectedDate, -1))}
                  onNext={() => handleDateSelect(addDashboardDays(selectedDate, 1))}
                />
              }
            >
              <DashboardTargetComparisonChart
                meetings={dailyDashboard.meetings}
                selectedMeetingId={selectedMeetingId}
                onSelect={setSelectedMeetingId}
              />
            </DashboardTargetComparisonCard>
            <DashboardSummaryCard
              totalMeetings={summary.totalMeetings}
              totalDurationSeconds={summary.totalMeetingDurationSeconds}
              averageDurationSeconds={summary.averageMeetingDurationSeconds}
              overtimeMeetings={summary.overtimeMeetings}
              contextOutSeconds={summary.totalContextOutSeconds}
              contextOutRate={summary.contextOutRate}
            />
            <DashboardTopicsCard topics={dailyDashboard.topics} />
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
