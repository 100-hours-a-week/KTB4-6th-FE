import { notFound } from 'next/navigation';
import { CurrentMeetingPage } from '@/views/current-meeting';

interface CurrentMeetingRouteProps {
  params: Promise<{ teamId: string; meetingId: string }>;
}

export default async function CurrentMeetingRoute({ params }: CurrentMeetingRouteProps) {
  const { meetingId } = await params;

  if (!Number.isSafeInteger(Number(meetingId)) || Number(meetingId) <= 0) {
    notFound();
  }

  return <CurrentMeetingPage />;
}
