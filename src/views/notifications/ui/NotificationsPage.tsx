'use client';

import { useNotifications } from '@/features/notification';
import { NotificationsHeader } from './NotificationsHeader';

interface NotificationsPageProps {
  teamId: number;
}

export const NotificationsPage = ({ teamId }: NotificationsPageProps) => {
  const { data: notifications } = useNotifications(teamId);
  const hasUnread = notifications?.some((notification) => !notification.isRead) ?? false;

  return (
    <div className="flex h-dvh min-h-[844px] flex-col bg-white">
      <NotificationsHeader teamId={teamId} isReadAllDisabled={!hasUnread} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" />
    </div>
  );
};
