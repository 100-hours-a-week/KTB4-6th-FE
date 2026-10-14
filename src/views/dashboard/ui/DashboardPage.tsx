'use client';

import { useState } from 'react';
import { DEFAULT_DASHBOARD_PERIOD_DAYS, type DashboardPeriodDays } from '@/features/dashboard';
import { useTeamDetail } from '@/features/team-management';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { DASHBOARD_PREVIEW_SUMMARY } from '../model/dashboard-preview';
import { DashboardHeader } from './DashboardHeader';
import { DashboardPeriodTabs } from './DashboardPeriodTabs';
import { DashboardSummaryCard } from './DashboardSummaryCard';

interface DashboardPageProps {
  teamId: number;
}

export const DashboardPage = ({ teamId }: DashboardPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [periodDays, setPeriodDays] = useState<DashboardPeriodDays>(DEFAULT_DASHBOARD_PERIOD_DAYS);
  const { data: team } = useTeamDetail(teamId);
  const summary = DASHBOARD_PREVIEW_SUMMARY;

  return (
    <div className="flex h-dvh min-h-[844px] flex-col bg-cool-50">
      <DashboardHeader isMenuDisabled={!team} onMenuClick={() => setIsSidebarOpen(true)} />
      <DashboardPeriodTabs selectedDays={periodDays} onSelect={setPeriodDays} />

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-[22px] pt-[18px] pb-8">
        <DashboardSummaryCard
          totalMeetings={summary.totalMeetings}
          totalDurationSeconds={summary.totalMeetingDurationSeconds}
          averageDurationSeconds={summary.averageMeetingDurationSeconds}
          overtimeRate={summary.overtimeDurationRate}
          contextOutSeconds={summary.totalContextOutSeconds}
        />
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
