'use client';
import { useState } from 'react';
import { MeetingListHeader } from './MeetingListHeader';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { MeetingListSection } from './MeetingListSection';
import { mockMeetings } from '../model/preview-meeting-list';

interface MeetingListPageProps {
  teamId: number;
}

export const MeetingListPage = ({ teamId }: MeetingListPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const teamName = `팀 ${teamId}`;
  return (
    <div className="flex min-h-[844px] flex-1 flex-col bg-cool-50">
      <MeetingListHeader teamName={teamName} onMenuClick={() => setIsSidebarOpen(true)} />

      <MeetingListSection meetings={mockMeetings} teamId={teamId} />

      <NavigationSidebar
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        teamId={teamId}
        teamName={teamName}
      />
    </div>
  );
};
