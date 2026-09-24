'use client';

import { useState } from 'react';
import { useActiveMeeting, useHome } from '@/features/home';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { CreateMeetingButton } from './CreateMeetingButton';
import { HomeErrorState } from './HomeErrorState';
import { HomeHeader } from './HomeHeader';
import { HomePageSkeleton } from './HomePageSkeleton';
import { MeetingListSection } from './MeetingListSection';
import { TeamSummaryCard } from './TeamSummaryCard';
import { toHomeViewModel } from '../model/home-view-model';
import { useRedirectToActiveTeam } from '../model/useRedirectToActiveTeam';

interface HomePageProps {
  teamId: number;
}

export const HomePage = ({ teamId }: HomePageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: home, dataUpdatedAt, isFetching, isError, refetch } = useHome({ isEnabled: true });

  const { activeMeeting, isPending: isActiveMeetingPending } = useActiveMeeting(teamId);

  useRedirectToActiveTeam({
    activeTeamId: home?.team.teamId,
    dataUpdatedAt,
    isError,
    isFetching,
    refetch,
    urlTeamId: teamId,
  });

  if (!home || home.team.teamId !== teamId) {
    if (isError && !isFetching) {
      return <HomeErrorState />;
    }

    return <HomePageSkeleton />;
  }

  const { team, meetings } = toHomeViewModel(home);

  return (
    <div className="flex min-h-[844px] flex-1 flex-col bg-cool-50">
      <HomeHeader onMenuClick={() => setIsSidebarOpen(true)} />
      <TeamSummaryCard team={team} />
      <CreateMeetingButton
        teamId={teamId}
        activeMeetingId={activeMeeting?.meetingId ?? null}
        isDisabled={isActiveMeetingPending}
      />
      <MeetingListSection meetings={meetings} teamId={teamId} />

      <NavigationSidebar
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        teamId={teamId}
        teamName={team.name}
      />
    </div>
  );
};
