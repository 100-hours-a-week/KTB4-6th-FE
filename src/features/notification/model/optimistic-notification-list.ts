import type { QueryClient } from '@tanstack/react-query';
import { notificationKeys } from './query-keys';
import type { NotificationData } from './types';

export interface NotificationListSnapshot {
  previousNotifications: NotificationData[] | undefined;
}

export const updateNotificationListOptimistically = async (
  queryClient: QueryClient,
  teamId: number,
  update: (notifications: NotificationData[]) => NotificationData[],
): Promise<NotificationListSnapshot> => {
  const listKey = notificationKeys.list(teamId);

  await queryClient.cancelQueries({ queryKey: listKey });

  const previousNotifications = queryClient.getQueryData<NotificationData[]>(listKey);

  queryClient.setQueryData<NotificationData[]>(listKey, (notifications) =>
    notifications ? update(notifications) : notifications,
  );

  return { previousNotifications };
};

export const restoreNotificationList = (
  queryClient: QueryClient,
  teamId: number,
  snapshot: NotificationListSnapshot | undefined,
) => {
  queryClient.setQueryData(notificationKeys.list(teamId), snapshot?.previousNotifications);
};
