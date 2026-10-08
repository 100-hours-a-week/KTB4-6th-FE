import { NotificationsPage } from '@/views/notifications';

interface NotificationsProps {
  params: Promise<{ teamId: string }>;
}

export default async function Notifications({ params }: NotificationsProps) {
  const { teamId } = await params;

  return <NotificationsPage teamId={Number(teamId)} />;
}
