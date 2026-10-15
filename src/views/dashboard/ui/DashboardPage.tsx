'use client';

import { useState } from 'react';
import {
  DEFAULT_DASHBOARD_PERIOD_DAYS,
  type DashboardPeriodDays,
  useDashboard,
} from '@/features/dashboard';
import { useTeamDetail } from '@/features/team-management';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { getDefaultRangeIndex, toSelectedRangeSummary } from '../model/target-comparison-view';
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
  const [periodDays, setPeriodDays] = useState<DashboardPeriodDays>(DEFAULT_DASHBOARD_PERIOD_DAYS);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState<number | null>(null);
  const { data: team } = useTeamDetail(teamId);
  const {
    data: dashboard,
    isPending: isDashboardPending,
    isFetching: isDashboardFetching,
    refetch: refetchDashboard,
  } = useDashboard(teamId, periodDays);
  const chart = dashboard?.chart ?? [];
  const hasMeetings = (dashboard?.summary.totalMeetings ?? 0) > 0;
  const activeRangeIndex = selectedRangeIndex ?? getDefaultRangeIndex(chart);
  const selectedRangeSummary = hasMeetings ? toSelectedRangeSummary(chart[activeRangeIndex]) : null;

  const handlePeriodSelect = (days: DashboardPeriodDays) => {
    setPeriodDays(days);
    setSelectedRangeIndex(null);
  };

  return (
    <div className="flex h-dvh min-h-[844px] flex-col bg-cool-50">
      <DashboardHeader isMenuDisabled={!team} onMenuClick={() => setIsSidebarOpen(true)} />
      <DashboardPeriodTabs selectedDays={periodDays} onSelect={handlePeriodSelect} />

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-[22px] pt-[18px] pb-8">
        {dashboard ? (
          <>
            <DashboardSummaryCard
              totalMeetings={dashboard.summary.totalMeetings}
              totalDurationSeconds={dashboard.summary.totalMeetingDurationSeconds}
              averageDurationSeconds={dashboard.summary.averageMeetingDurationSeconds}
              overtimeRate={dashboard.summary.overtimeDurationRate}
              contextOutSeconds={dashboard.summary.totalContextOutSeconds}
            />
            <DashboardTargetComparisonCard selectedRangeSummary={selectedRangeSummary}>
              <DashboardTargetComparisonChart
                ranges={chart}
                selectedIndex={activeRangeIndex}
                onSelect={setSelectedRangeIndex}
              />
            </DashboardTargetComparisonCard>
            <DashboardTopicsCard topics={dashboard.topics} />
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
