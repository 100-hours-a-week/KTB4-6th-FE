'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown } from 'lucide-react';
import { getTeamDetail } from '@/features/team-management';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import type { CompletedMeetingTab } from '../model/completed-meeting-tab';
import { getActiveTranscriptId } from '../model/get-active-transcript-id';
import { useTranscriptAutoFollow } from '../model/useTranscriptAutoFollow';
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
  const {
    isPlaying,
    isMuted,
    canPlay,
    displayMs,
    togglePlay,
    seek,
    beginScrub,
    updateScrub,
    endScrub,
    toggleMute,
  } = useAudioPlayer(audioSource);
  // 재생 위치(끄는 중이면 끄는 위치)에 해당하는 발화를 강조한다. 플레이어가 없으면 강조하지 않는다.
  const activeEntryId = isAudioPlayerVisible
    ? getActiveTranscriptId(meeting.transcriptEntries, displayMs)
    : null;
  const {
    containerRef: transcriptScrollRef,
    isFollowing,
    resumeFollowing,
  } = useTranscriptAutoFollow(activeEntryId, isAudioPlayerVisible);

  // 재생 위치를 직접 옮기는 것은 그 위치를 보겠다는 뜻이라, 스크롤이 멈춰 있었어도 다시 따라간다.
  const handleSeek = (ms: number) => {
    resumeFollowing();
    seek(ms);
  };
  const handleScrubStart = (ms: number) => {
    resumeFollowing();
    beginScrub(ms);
  };

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

      <div className="relative flex min-h-0 flex-1 flex-col">
        <main
          ref={transcriptScrollRef}
          data-tab={tab}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
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
            <TranscriptTab entries={meeting.transcriptEntries} activeEntryId={activeEntryId} />
          )}
        </main>
        {isAudioPlayerVisible && !isFollowing && activeEntryId && (
          <button
            type="button"
            aria-label="현재 재생 위치로 이동"
            onClick={resumeFollowing}
            className="absolute right-5 bottom-4 flex size-10 items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_8px_24px_rgba(20,34,56,0.24)]"
          >
            <ArrowDown aria-hidden="true" className="size-5" strokeWidth={2.2} />
          </button>
        )}
      </div>

      {tab === 'transcript' && hasTranscript && isAudioExpired && <AudioExpiredNotice />}
      {isAudioPlayerVisible && (
        <AudioPlayer
          isPlaying={isPlaying}
          isMuted={isMuted}
          canPlay={canPlay}
          displayMs={displayMs}
          durationSeconds={meeting.audioDurationSeconds}
          onTogglePlay={togglePlay}
          onToggleMute={toggleMute}
          onSeek={handleSeek}
          onScrubStart={handleScrubStart}
          onScrubMove={updateScrub}
          onScrubEnd={endScrub}
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
