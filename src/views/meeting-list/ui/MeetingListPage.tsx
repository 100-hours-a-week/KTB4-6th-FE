'use client';
import { useState } from 'react';
import { useTeamDetail } from '@/features/team-management';
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
  const { data: team } = useTeamDetail(teamId);
  // 팀 정보가 오기 전에는 팀원으로 취급해 팀장 전용 메뉴가 잠깐 보이지 않게 한다.
  const viewerRole: TeamMemberRole = team?.role === 'LEADER' ? 'leader' : 'member';
  const { status, today, groups, hasMore, loadMoreStatus, loadMore } =
    useMeetingListPageData(teamId);

  return (
    <div className="flex min-h-[844px] flex-1 flex-col bg-cool-50">
      <MeetingListHeader
        teamName={team?.name ?? ''}
        isMenuDisabled={!team}
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      {status === 'loading' ? (
        <MeetingListSkeleton />
      ) : status === 'error' ? (
        <MeetingListErrorState />
      ) : (
        <MeetingListSection
          today={today}
          groups={groups}
          teamId={teamId}
          viewerRole={viewerRole}
          hasMore={hasMore}
          loadMoreStatus={loadMoreStatus}
          onLoadMore={loadMore}
        />
      )}

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
