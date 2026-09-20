'use client';

import { useState } from 'react';
import { useHome } from '@/features/home';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { CreateMeetingButton } from './CreateMeetingButton';
import { HomeHeader } from './HomeHeader';
import { MeetingListSection } from './MeetingListSection';
import { TeamSummaryCard } from './TeamSummaryCard';
import { toHomeViewModel } from '../model/home-view-model';

export const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: home } = useHome({ isEnabled: true });

  if (!home) {
    return null;
  }

  const { team, meetings } = toHomeViewModel(home);

  return (
    <div className="flex min-h-[844px] flex-1 flex-col bg-cool-50">
      <HomeHeader onMenuClick={() => setIsSidebarOpen(true)} />
      <TeamSummaryCard team={team} />
      <CreateMeetingButton />
      <MeetingListSection meetings={meetings} />

      <NavigationSidebar
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        teamName={team.name}
      />
    </div>
  );
};
