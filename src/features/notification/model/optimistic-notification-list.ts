import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import { notificationKeys } from './query-keys';
import type { NotificationData, NotificationListData } from './types';

type NotificationListCache = InfiniteData<NotificationListData, number | undefined>;

export interface NotificationListSnapshot {
  previousList: NotificationListCache | undefined;
}

interface OptimisticUpdateOptions {
  unreadCount?: number;
}

const countUnread = (notifications: NotificationData[]) =>
  notifications.filter((notification) => !notification.isRead).length;

export const updateNotificationListOptimistically = async (
  queryClient: QueryClient,
  teamId: number,
  update: (notifications: NotificationData[]) => NotificationData[],
  options: OptimisticUpdateOptions = {},
): Promise<NotificationListSnapshot> => {
  const listKey = notificationKeys.list(teamId);

  await queryClient.cancelQueries({ queryKey: listKey });

  const previousList = queryClient.getQueryData<NotificationListCache>(listKey);

  queryClient.setQueryData<NotificationListCache>(listKey, (list) => {
    if (!list) {
      return list;
    }

    let clearedUnreadCount = 0;
    const pages = list.pages.map((page) => {
      const notifications = update(page.notifications);
      clearedUnreadCount += countUnread(page.notifications) - countUnread(notifications);

      return { ...page, notifications };
    });
    const unreadCount =
      options.unreadCount ?? Math.max(0, (list.pages[0]?.unreadCount ?? 0) - clearedUnreadCount);

    return { ...list, pages: pages.map((page) => ({ ...page, unreadCount })) };
  });

  return { previousList };
};

export const restoreNotificationList = (
  queryClient: QueryClient,
  teamId: number,
  snapshot: NotificationListSnapshot | undefined,
) => {
  queryClient.setQueryData(notificationKeys.list(teamId), snapshot?.previousList);
};
