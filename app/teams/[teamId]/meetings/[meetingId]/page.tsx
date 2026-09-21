import { notFound } from 'next/navigation';
import { CurrentMeetingPage } from '@/views/current-meeting';

interface CurrentMeetingRouteProps {
  params: Promise<{ teamId: string; meetingId: string }>;
  searchParams: Promise<{ preview?: string | string[] }>;
}

export default async function CurrentMeetingRoute({
  params,
  searchParams,
}: CurrentMeetingRouteProps) {
  const { meetingId } = await params;

  if (!Number.isSafeInteger(Number(meetingId)) || Number(meetingId) <= 0) {
    notFound();
  }

  // UI 작업 중 상태별 화면을 확인하기 위한 개발 환경 전용 미리보기다.
  const preview = process.env.NODE_ENV === 'development' ? (await searchParams).preview : undefined;

  return <CurrentMeetingPage previewState={typeof preview === 'string' ? preview : undefined} />;
}
