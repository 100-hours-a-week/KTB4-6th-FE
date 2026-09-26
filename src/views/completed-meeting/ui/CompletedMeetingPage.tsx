'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTeamDetail } from '@/features/team-management';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import type { CompletedMeetingTab } from '../model/completed-meeting-tab';
import {
  getCompletedMeetingPreview,
  type CompletedMeetingPreviewState,
  type CompletedMeetingViewerRole,
} from '../model/preview-completed-meeting';
import { useAudioViewState } from '../model/useAudioViewState';
import { CompletedMeetingHeader } from './CompletedMeetingHeader';
import { CompletedMeetingTabs } from './CompletedMeetingTabs';
import { SummaryScreen } from './SummaryScreen';
import { TranscriptScreen } from './TranscriptScreen';

interface CompletedMeetingPageProps {
  teamId: string;
  meetingId: number;
  tab: CompletedMeetingTab;
  /** 개발 환경 전용 미리보기 상태. 없으면 실제 회의 데이터를 쓴다. */
  previewState?: CompletedMeetingPreviewState;
  /** 개발 환경 전용 미리보기 보는 사람의 권한. 실제 데이터에서는 팀 역할로 판단한다. */
  previewRole?: CompletedMeetingViewerRole;
}

export const CompletedMeetingPage = ({
  teamId,
  meetingId,
  tab,
  previewState,
  previewRole = 'leader',
}: CompletedMeetingPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const numericTeamId = Number(teamId);
  const { data: team } = useQuery({
    queryKey: ['teams', numericTeamId, 'detail'],
    queryFn: () => getTeamDetail(numericTeamId),
    enabled: Number.isSafeInteger(numericTeamId) && numericTeamId > 0,
  });
  // TODO: 회의 상세 조회 응답으로 교체한다.
  const meeting = getCompletedMeetingPreview(previewState ?? 'completed');
  // 팀 정보가 오기 전에는 팀장인지 알 수 없어 팀원으로 본다. 미리보기는 지정한 권한을 쓴다.
  const viewerRole: CompletedMeetingViewerRole = previewState
    ? previewRole
    : team?.role === 'LEADER'
      ? 'leader'
      : 'member';
  const { state: audio, retry: retryAudioFile } = useAudioViewState({
    meetingId,
    previewAudio: previewState
      ? {
          remainingDays: meeting.audioRemainingDays,
          durationSeconds: meeting.audioDurationSeconds,
        }
      : undefined,
  });

  const getTabHref = (nextTab: CompletedMeetingTab) => {
    const params = new URLSearchParams({ tab: nextTab });
    if (previewState) params.set('preview', previewState);
    if (previewState && viewerRole === 'member') params.set('role', viewerRole);
    return `/teams/${encodeURIComponent(teamId)}/meetings/${meetingId}?${params.toString()}`;
  };

  return (
    <div className="flex h-dvh min-h-[844px] flex-col bg-cool-50">
      <header className="shrink-0 bg-white">
        <CompletedMeetingHeader
          meeting={meeting}
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
          previewSummaryStatus={previewState ? meeting.summaryStatus : undefined}
          previewCredits={previewState ? meeting.teamCredits : undefined}
          transcriptHref={getTabHref('transcript')}
        />
      ) : (
        <TranscriptScreen
          meetingId={meetingId}
          previewEntries={previewState ? meeting.transcriptEntries : undefined}
          audio={audio}
          onAudioFileRetry={retryAudioFile}
        />
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
