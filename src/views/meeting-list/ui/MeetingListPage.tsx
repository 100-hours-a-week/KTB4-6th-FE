'use client';
import { useState } from 'react';
import { MeetingListHeader } from './MeetingListHeader';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';

interface MeetingListPageProps {
  teamId: number;
}

export const MeetingListPage = ({ teamId }: MeetingListPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const teamName = `팀 ${teamId}`;
  return (
    <div className="flex min-h-[844px] flex-1 flex-col bg-cool-50">
      <MeetingListHeader teamName={`팀 ${teamId}`} onMenuClick={() => setIsSidebarOpen(true)} />
      <h1>회의 목록 (팀 {teamId})</h1>

      <NavigationSidebar
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        teamId={teamId}
        teamName={teamName}
      />
    </div>
  );
};
