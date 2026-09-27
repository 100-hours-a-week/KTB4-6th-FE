import { MeetingListPage } from '@/views/meeting-list';

interface MeetingsProps {
  params: Promise<{ teamId: string }>;
}

export default async function Meetings({ params }: MeetingsProps) {
  const { teamId } = await params;

  return <MeetingListPage teamId={Number(teamId)} />;
}
