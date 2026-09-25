import type { CompletedMeetingTab } from '../model/completed-meeting-tab';
import { mockMeetingSummary } from '../model/preview-meeting-summary';
import { mockTranscriptEntries } from '../model/preview-meeting-transcript';
import {
  getCompletedMeetingPreview,
  type CompletedMeetingPreviewState,
} from '../model/preview-completed-meeting';
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
  /** 개발 환경 전용 미리보기 상태. 없으면 기본(요약 결과) 목데이터를 쓴다. */
  previewState?: CompletedMeetingPreviewState;
}

export const CompletedMeetingPage = ({
  teamId,
  meetingId,
  tab,
  previewState = 'completed',
}: CompletedMeetingPageProps) => {
  // TODO: 회의 상세·음성 파일 조회 응답으로 교체한다.
  const meeting = getCompletedMeetingPreview(previewState);
  const isPreviewing = previewState !== 'completed';

  const getTabHref = (nextTab: CompletedMeetingTab) => {
    const params = new URLSearchParams({ tab: nextTab });
    if (isPreviewing) params.set('preview', previewState);
    return `/teams/${encodeURIComponent(teamId)}/meetings/${meetingId}?${params.toString()}`;
  };

  return (
    <div className="flex h-dvh min-h-[844px] flex-col bg-cool-50">
      <header className="shrink-0 bg-white">
        <CompletedMeetingHeader meeting={meeting} />
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
            {meeting.summaryStatus === 'completed' && <SummaryTab summary={mockMeetingSummary} />}
          </>
        ) : (
          // TODO: 전사 목록 조회 API 응답으로 교체한다.
          <TranscriptTab entries={mockTranscriptEntries} />
        )}
      </main>

      {tab === 'transcript' && (
        // TODO: 음성이 만료된 상태에서는 플레이어 대신 만료 안내를 보여준다.
        <AudioPlayer currentSeconds={0} durationSeconds={meeting.audioDurationSeconds} />
      )}
    </div>
  );
};
