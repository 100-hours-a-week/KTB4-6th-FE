'use client';

import {
  useDeleteNotification,
  useHasUnreadNotification,
  useNotifications,
  useOpenNotification,
  useReadAllNotifications,
  type NotificationData,
} from '@/features/notification';
import { useAppToast } from '@/shared/ui';
import { notificationToastMessages } from '../model/toast-messages';
import { NotificationListItem } from './NotificationListItem';
import { NotificationsEmptyState } from './NotificationsEmptyState';
import { NotificationsErrorState } from './NotificationsErrorState';
import { NotificationsHeader } from './NotificationsHeader';
import { NotificationsSkeleton } from './NotificationsSkeleton';

interface NotificationsPageProps {
  teamId: number;
}

export const NotificationsPage = ({ teamId }: NotificationsPageProps) => {
  const { data, isPending, isError } = useNotifications(teamId);
  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];
  const { mutate: deleteNotification } = useDeleteNotification(teamId);
  const { mutate: readAllNotifications } = useReadAllNotifications(teamId);
  const { showToast } = useAppToast();
  const hasUnread = useHasUnreadNotification(teamId);

  const openNotification = useOpenNotification(teamId);

  const handleDelete = (notification: NotificationData) => {
    deleteNotification(notification.notificationId, {
      onError: () => {
        const { text, variant } = notificationToastMessages.deleteFailure;
        showToast(text, variant);
      },
    });
  };

  const handleReadAll = () => {
    readAllNotifications(undefined, {
      onError: () => {
        const { text, variant } = notificationToastMessages.readAllFailure;
        showToast(text, variant);
      },
    });
  };

  return (
    <div className="flex h-dvh min-h-[844px] flex-col bg-white">
      <NotificationsHeader
        teamId={teamId}
        isReadAllDisabled={!hasUnread}
        onReadAllClick={handleReadAll}
      />
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
                  onSelect={openNotification}
                  onDelete={handleDelete}
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
