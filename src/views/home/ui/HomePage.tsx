'use client';

import { useState } from 'react';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { CreateMeetingButton } from './CreateMeetingButton';
import { HomeHeader } from './HomeHeader';
import { MeetingListSection } from './MeetingListSection';
import { TeamSummaryCard } from './TeamSummaryCard';
import { mockMeetings, mockTeamSummary } from '../model/mock';

export const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[844px] flex-1 flex-col bg-cool-50">
      <HomeHeader onMenuClick={() => setIsSidebarOpen(true)} />
      <TeamSummaryCard team={mockTeamSummary} />
      <CreateMeetingButton />
      <MeetingListSection meetings={mockMeetings} />

      <NavigationSidebar
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        teamName={mockTeamSummary.name}
      />
    </div>
  );
};
