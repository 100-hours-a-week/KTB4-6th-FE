import { notFound } from 'next/navigation';
import { CompletedMeetingPage, parseCompletedMeetingTab } from '@/views/completed-meeting';
import { CurrentMeetingPage } from '@/views/current-meeting';

interface MeetingRouteProps {
  params: Promise<{ teamId: string; meetingId: string }>;
  searchParams: Promise<{
    tab?: string | string[];
  }>;
}

export default async function MeetingRoute({ params, searchParams }: MeetingRouteProps) {
  const { teamId, meetingId } = await params;

  if (!Number.isSafeInteger(Number(meetingId)) || Number(meetingId) <= 0) {
    notFound();
  }

  const { tab } = await searchParams;

  return (
    <CurrentMeetingPage
      teamId={teamId}
      meetingId={Number(meetingId)}
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
