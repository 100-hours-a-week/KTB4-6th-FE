'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTeamDetail } from '@/features/team-management';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import type { CompletedMeetingTab } from '../model/completed-meeting-tab';
import { useAudioPlayer } from '../model/useAudioPlayer';
import { usePreviewAudioSource } from '../model/usePreviewAudioSource';
import { mockMeetingSummary } from '../model/preview-meeting-summary';
import {
  getCompletedMeetingPreview,
  type CompletedMeetingPreviewState,
  type CompletedMeetingViewerRole,
} from '../model/preview-completed-meeting';
import { AudioExpiredNotice } from './AudioExpiredNotice';
import { AudioPlayer } from './AudioPlayer';
import { CompletedMeetingHeader } from './CompletedMeetingHeader';
import { CompletedMeetingTabs } from './CompletedMeetingTabs';
import { SummaryFailedState } from './SummaryFailedState';
import { SummaryGeneratingState } from './SummaryGeneratingState';
import { SummaryTab } from './SummaryTab';
import { TranscriptTab } from './TranscriptTab';

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
  // TODO: 회의 상세·음성 파일 조회 응답과 팀 역할 조회 응답으로 교체한다.
  const meeting = getCompletedMeetingPreview(previewState ?? 'completed');
  const viewerRole = previewRole;
  const hasTranscript = meeting.transcriptEntries.length > 0;
  const isAudioExpired = meeting.audioRemainingDays === null;
  const isAudioPlayerVisible = tab === 'transcript' && hasTranscript && !isAudioExpired;
  const audioSource = usePreviewAudioSource(meeting.audioDurationSeconds, isAudioPlayerVisible);
  const { isPlaying, canPlay, currentMs, togglePlay } = useAudioPlayer(audioSource);

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
          viewerRole={viewerRole}
          isMenuDisabled={!team}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <CompletedMeetingTabs currentTab={tab} getTabHref={getTabHref} />
      </header>

      <main data-tab={tab} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {tab === 'summary' ? (
          // TODO: AI 요약 조회 API 응답으로 교체한다.
          <>
            {meeting.summaryStatus === 'generating' && <SummaryGeneratingState />}
            {meeting.summaryStatus === 'failed' && (
              <SummaryFailedState transcriptHref={getTabHref('transcript')} />
            )}
            {meeting.summaryStatus === 'completed' && (
              <SummaryTab summary={mockMeetingSummary} currentCredits={meeting.teamCredits} />
            )}
          </>
        ) : (
          // TODO: 전사 목록 조회 API 응답으로 교체한다.
          <TranscriptTab entries={meeting.transcriptEntries} />
        )}
      </main>

      {tab === 'transcript' && hasTranscript && isAudioExpired && <AudioExpiredNotice />}
      {isAudioPlayerVisible && (
        <AudioPlayer
          isPlaying={isPlaying}
          canPlay={canPlay}
          currentMs={currentMs}
          durationSeconds={meeting.audioDurationSeconds}
          onTogglePlay={togglePlay}
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
