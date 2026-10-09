'use client';

import { useRouter } from 'next/navigation';
import {
  getNotificationHref,
  useNotifications,
  useReadNotification,
  type NotificationData,
} from '@/features/notification';
import { NotificationListItem } from './NotificationListItem';
import { NotificationsEmptyState } from './NotificationsEmptyState';
import { NotificationsErrorState } from './NotificationsErrorState';
import { NotificationsHeader } from './NotificationsHeader';
import { NotificationsSkeleton } from './NotificationsSkeleton';

interface NotificationsPageProps {
  teamId: number;
}

export const NotificationsPage = ({ teamId }: NotificationsPageProps) => {
  const { data: notifications, isPending, isError } = useNotifications(teamId);
  const { mutate: readNotification } = useReadNotification(teamId);
  const router = useRouter();
  const hasUnread = notifications?.some((notification) => !notification.isRead) ?? false;

  const handleSelect = (notification: NotificationData) => {
    if (!notification.isRead) {
      readNotification(notification.notificationId);
    }

    const href = getNotificationHref(teamId, notification);

    if (href) {
      router.push(href);
    }
  };

  return (
    <div className="flex h-dvh min-h-[844px] flex-col bg-white">
      <NotificationsHeader teamId={teamId} isReadAllDisabled={!hasUnread} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {isPending ? (
          <NotificationsSkeleton />
        ) : isError ? (
          <NotificationsErrorState />
        ) : notifications.length === 0 ? (
          <NotificationsEmptyState />
        ) : (
          <>
            <ul>
              {notifications.map((notification) => (
                <NotificationListItem
                  key={notification.notificationId}
                  notification={notification}
                  onSelect={handleSelect}
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
