import type { CompletedMeetingTab } from '../model/completed-meeting-tab';

interface CompletedMeetingPageProps {
  teamId: string;
  meetingId: number;
  tab: CompletedMeetingTab;
}

const TAB_LABELS: Record<CompletedMeetingTab, string> = {
  summary: '요약',
  transcript: '녹취',
};

// TODO: 종료 회의 화면(요약·녹취 탭)을 구현한다. 지금은 상태별 분기와 탭 주소만 확인하는 껍데기다.
export const CompletedMeetingPage = ({ tab }: CompletedMeetingPageProps) => (
  <main
    data-tab={tab}
    className="flex flex-1 flex-col items-center justify-center bg-cool-50 px-6 text-center"
  >
    <p className="text-base font-bold text-cool-900">종료된 회의</p>
    <p className="mt-2 text-sm text-cool-500">{TAB_LABELS[tab]} 화면은 준비 중입니다</p>
  </main>
);
