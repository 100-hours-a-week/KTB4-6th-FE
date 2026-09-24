import { notFound } from 'next/navigation';
import { CreateMeetingPage } from '@/views/create-meeting';

interface CreateMeetingRouteProps {
  params: Promise<{ teamId: string }>;
}

export default async function CreateMeetingRoute({ params }: CreateMeetingRouteProps) {
  const { teamId } = await params;
  const numericTeamId = Number(teamId);

  if (!Number.isSafeInteger(numericTeamId) || numericTeamId <= 0) {
    notFound();
  }

  return <CreateMeetingPage teamId={numericTeamId} />;
}
