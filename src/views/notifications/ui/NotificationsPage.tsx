'use client';

import { useNotifications } from '@/features/notification';
import { NotificationListItem } from './NotificationListItem';
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
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {notifications && (
          <>
            <ul>
              {notifications.map((notification) => (
                <NotificationListItem
                  key={notification.notificationId}
                  notification={notification}
                />
              ))}
            </ul>
            <p className="py-6 text-center text-[13px] text-cool-500">
              알림은 30일이 지나면 자동으로 삭제됩니다
            </p>
          </>
        )}
      </div>
    </div>
  );
};
