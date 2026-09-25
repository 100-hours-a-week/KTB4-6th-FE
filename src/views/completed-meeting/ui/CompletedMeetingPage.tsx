import type { CompletedMeetingTab } from '../model/completed-meeting-tab';
import {
  getCompletedMeetingPreview,
  type CompletedMeetingPreviewState,
} from '../model/preview-completed-meeting';
import { CompletedMeetingHeader } from './CompletedMeetingHeader';
import { CompletedMeetingTabs } from './CompletedMeetingTabs';

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

      {/* TODO: 요약·전사 탭 내용을 구현한다. */}
      <main data-tab={tab} className="flex flex-1 items-center justify-center px-6 text-center">
        <p className="text-sm text-cool-500">
          {tab === 'summary' ? '요약' : '전사'} 화면은 준비 중입니다
        </p>
      </main>
    </div>
  );
};
