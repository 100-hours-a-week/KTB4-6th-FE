'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMeetingDetail } from '@/features/meeting';
import { getTeamDetail } from '@/features/team-management';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import type { CompletedMeetingTab } from '../model/completed-meeting-tab';
import { useAudioViewState } from '../model/useAudioViewState';
import { CompletedMeetingHeader } from './CompletedMeetingHeader';
import { CompletedMeetingLoadingState } from './CompletedMeetingLoadingState';
import { CompletedMeetingTabs } from './CompletedMeetingTabs';
import { SummaryScreen } from './SummaryScreen';
import { TranscriptScreen } from './TranscriptScreen';

interface CompletedMeetingPageProps {
  teamId: string;
  meetingId: number;
  tab: CompletedMeetingTab;
}

export const CompletedMeetingPage = ({ teamId, meetingId, tab }: CompletedMeetingPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const numericTeamId = Number(teamId);
  const { data: team } = useQuery({
    queryKey: ['teams', numericTeamId, 'detail'],
    queryFn: () => getTeamDetail(numericTeamId),
    enabled: Number.isSafeInteger(numericTeamId) && numericTeamId > 0,
  });
  const meetingDetailQuery = useMeetingDetail(meetingId);
  // 팀 정보가 오기 전에는 팀장인지 알 수 없어 팀원으로 본다.
  const viewerRole = team?.role === 'LEADER' ? 'leader' : 'member';
  const { state: audio, retry: retryAudioFile } = useAudioViewState({ meetingId });

  const getTabHref = (nextTab: CompletedMeetingTab) =>
    `/teams/${encodeURIComponent(teamId)}/meetings/${meetingId}?tab=${nextTab}`;

  // 회의 상세를 아직 못 받았으면 화면 전체를 로딩·오류로 대체한다.
  const meetingDetail = meetingDetailQuery.data;
  if (meetingDetailQuery.isPending || meetingDetailQuery.isError || !meetingDetail) {
    return (
      <CompletedMeetingLoadingState
        isPending={meetingDetailQuery.isPending}
        teamHomeHref={`/teams/${encodeURIComponent(teamId)}`}
      />
    );
  }

  const headerMeeting = {
    title: meetingDetail.title,
    startedAt: meetingDetail.startedAt ?? '',
    endedAt: meetingDetail.endedAt ?? '',
  };

  return (
    <div className="flex h-dvh min-h-[844px] flex-col bg-cool-50">
      <header className="shrink-0 bg-white">
        <CompletedMeetingHeader
          teamId={teamId}
          meetingId={meetingId}
          meeting={headerMeeting}
          audio={audio}
          viewerRole={viewerRole}
          isMenuDisabled={!team}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <CompletedMeetingTabs currentTab={tab} getTabHref={getTabHref} />
      </header>

      {tab === 'summary' ? (
        <SummaryScreen
          meetingId={meetingId}
          teamId={numericTeamId}
          transcriptHref={getTabHref('transcript')}
        />
      ) : (
        <TranscriptScreen meetingId={meetingId} audio={audio} onAudioFileRetry={retryAudioFile} />
      )}

      {team && (
        <NavigationSidebar
          isOpen={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          teamId={numericTeamId}
          teamName={team.name}
        />
      )}
    </div>
  );
};
