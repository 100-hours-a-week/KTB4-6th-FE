'use client';
import { useEffect, useRef, useState } from 'react';
import { useTeamDetail } from '@/features/team-management';
import { MeetingListHeader } from './MeetingListHeader';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { MeetingListEmptyState } from './MeetingListEmptyState';
import { MeetingListErrorState } from './MeetingListErrorState';
import { MeetingListSection } from './MeetingListSection';
import { MeetingListSkeleton } from './MeetingListSkeleton';
import { MeetingSearchBar } from './MeetingSearchBar';
import { useMeetingListPageData } from '../model/useMeetingListPageData';
import { useMeetingSearchResults } from '../model/useMeetingSearchResults';
import { useMeetingSearchState } from '../model/useMeetingSearchState';
import type { TeamMemberRole } from '../model/type';

interface MeetingListPageProps {
  teamId: number;
}

export const MeetingListPage = ({ teamId }: MeetingListPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: team } = useTeamDetail(teamId);
  const viewerRole: TeamMemberRole = team?.role === 'LEADER' ? 'leader' : 'member';
  const { status, isEmpty, today, groups, hasMore, loadMoreStatus, loadMore } =
    useMeetingListPageData(teamId);
  const search = useMeetingSearchState();
  const searchResults = useMeetingSearchResults(teamId, search.submittedKeyword);
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const canSearch = status === 'success' && !isEmpty;
  const isSearchBarVisible = canSearch && search.isOpen;

  useEffect(() => {
    scrollRootRef.current?.scrollTo({ top: 0 });
  }, [search.submittedKeyword]);

  return (
    <div className="flex h-dvh min-h-[844px] flex-col bg-cool-50">
      <MeetingListHeader
        teamName={team?.name ?? ''}
        isMenuDisabled={!team}
        onMenuClick={() => setIsSidebarOpen(true)}
        isSearchOpen={search.isOpen}
        onSearchClick={canSearch ? (search.isOpen ? search.cancel : search.open) : undefined}
      />

      {isSearchBarVisible && (
        <div className="px-5 pt-4 pb-3">
          <MeetingSearchBar
            query={search.query}
            onQueryChange={search.setQuery}
            onClear={search.clearQuery}
            onSubmit={search.submit}
            onCancel={search.cancel}
          />
        </div>
      )}

      <div ref={scrollRootRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {status === 'loading' ? (
          <MeetingListSkeleton />
        ) : status === 'error' ? (
          <MeetingListErrorState />
        ) : isEmpty ? (
          <MeetingListEmptyState teamId={teamId} />
        ) : (
          <MeetingListSection
            today={today}
            groups={groups}
            teamId={teamId}
            viewerRole={viewerRole}
            viewerTeamMemberId={team?.teamMemberId ?? null}
            hasMore={hasMore}
            loadMoreStatus={loadMoreStatus}
            onLoadMore={loadMore}
            scrollRootRef={scrollRootRef}
            searchResults={search.isSearching ? searchResults : null}
            className={isSearchBarVisible ? 'mt-3' : undefined}
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
