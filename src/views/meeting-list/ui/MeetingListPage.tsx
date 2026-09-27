'use client';
import { useState } from 'react';
import { MeetingListHeader } from './MeetingListHeader';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { MeetingListErrorState } from './MeetingListErrorState';
import { MeetingListSection } from './MeetingListSection';
import { MeetingListSkeleton } from './MeetingListSkeleton';
import { useMeetingListPageData } from '../model/useMeetingListPageData';
import type { TeamMemberRole } from '../model/type';

interface MeetingListPageProps {
  teamId: number;
}

export const MeetingListPage = ({ teamId }: MeetingListPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const teamName = `팀 ${teamId}`;
  // TODO: 팀 멤버 역할 조회 API 연동 시 실제 역할로 교체한다.
  const viewerRole: TeamMemberRole = 'leader';
  const { status, meetings, hasMore, loadMoreStatus, loadMore } = useMeetingListPageData(teamId);

  return (
    <div className="flex min-h-[844px] flex-1 flex-col bg-cool-50">
      <MeetingListHeader teamName={teamName} onMenuClick={() => setIsSidebarOpen(true)} />

      {status === 'loading' ? (
        <MeetingListSkeleton />
      ) : status === 'error' ? (
        <MeetingListErrorState />
      ) : (
        <MeetingListSection
          meetings={meetings}
          teamId={teamId}
          viewerRole={viewerRole}
          hasMore={hasMore}
          loadMoreStatus={loadMoreStatus}
          onLoadMore={loadMore}
        />
      )}

      <NavigationSidebar
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        teamId={teamId}
        teamName={teamName}
      />
    </div>
  );
};
