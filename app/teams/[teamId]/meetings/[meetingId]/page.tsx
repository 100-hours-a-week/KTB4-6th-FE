import { notFound } from 'next/navigation';
import { CompletedMeetingPage, parseCompletedMeetingTab } from '@/views/completed-meeting';
import { CurrentMeetingPage } from '@/views/current-meeting';

interface MeetingRouteProps {
  params: Promise<{ teamId: string; meetingId: string }>;
  searchParams: Promise<{
    tab?: string | string[];
    preview?: string | string[];
    role?: string | string[];
  }>;
}

export default async function MeetingRoute({ params, searchParams }: MeetingRouteProps) {
  const { teamId, meetingId } = await params;

  if (!Number.isSafeInteger(Number(meetingId)) || Number(meetingId) <= 0) {
    notFound();
  }

  const { tab, preview, role } = await searchParams;

  // 회의 상태(종료 여부)는 화면에서 조회한 뒤 정해지므로, 종료 회의 화면을 함께 넘겨 분기한다.
  // preview·role은 UI 작업 중 상태별 화면을 확인하기 위한 개발 환경 전용 미리보기다.
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <CurrentMeetingPage
      teamId={teamId}
      meetingId={Number(meetingId)}
      previewState={isDevelopment && typeof preview === 'string' ? preview : undefined}
      previewRole={isDevelopment && role === 'participant' ? 'participant' : 'recorder'}
      completedView={
        <CompletedMeetingPage
          teamId={teamId}
          meetingId={Number(meetingId)}
          tab={parseCompletedMeetingTab(tab)}
        />
      }
    />
  );
}
