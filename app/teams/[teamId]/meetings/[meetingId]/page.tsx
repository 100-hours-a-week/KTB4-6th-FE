import { notFound } from 'next/navigation';
import { MeetingRouteSwitch } from '@/app/meeting-route';

interface MeetingRouteProps {
  params: Promise<{ teamId: string; meetingId: string }>;
}

export default async function MeetingRoute({ params }: MeetingRouteProps) {
  const { teamId, meetingId } = await params;

  if (!Number.isSafeInteger(Number(meetingId)) || Number(meetingId) <= 0) {
    notFound();
  }

  return <MeetingRouteSwitch teamId={teamId} meetingId={Number(meetingId)} />;
}
