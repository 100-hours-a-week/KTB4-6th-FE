import type { MeetingSummaryStatus } from '../model/preview-completed-meeting';
import { mockMeetingSummaryMarkdown } from '../model/preview-meeting-summary';
import { SummaryFailedState } from './SummaryFailedState';
import { SummaryGeneratingState } from './SummaryGeneratingState';
import { SummaryTab } from './SummaryTab';

interface SummaryScreenProps {
  summaryStatus: MeetingSummaryStatus;
  currentCredits: number;
  /** 요약 실패 화면의 `전사 보기`가 이동할 주소 */
  transcriptHref: string;
}

/** 요약 탭 화면. 요약 상태(생성 중·실패·완료)에 맞는 내용을 스크롤 영역에 보여준다. */
export const SummaryScreen = ({
  summaryStatus,
  currentCredits,
  transcriptHref,
}: SummaryScreenProps) => (
  <main data-tab="summary" className="flex min-h-0 flex-1 flex-col overflow-y-auto">
    {/* TODO: AI 요약 조회 API 응답으로 교체한다. */}
    {summaryStatus === 'generating' && <SummaryGeneratingState />}
    {summaryStatus === 'failed' && <SummaryFailedState transcriptHref={transcriptHref} />}
    {summaryStatus === 'completed' && (
      <SummaryTab content={mockMeetingSummaryMarkdown} currentCredits={currentCredits} />
    )}
  </main>
);
