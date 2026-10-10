import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import { notificationKeys } from './query-keys';
import type { NotificationData, NotificationListData } from './types';

type NotificationListCache = InfiniteData<NotificationListData, number | undefined>;

export interface NotificationListSnapshot {
  previousList: NotificationListCache | undefined;
}

export const updateNotificationListOptimistically = async (
  queryClient: QueryClient,
  teamId: number,
  update: (notifications: NotificationData[]) => NotificationData[],
): Promise<NotificationListSnapshot> => {
  const listKey = notificationKeys.list(teamId);

  await queryClient.cancelQueries({ queryKey: listKey });

  const previousList = queryClient.getQueryData<NotificationListCache>(listKey);

  queryClient.setQueryData<NotificationListCache>(listKey, (list) =>
    list
      ? {
          ...list,
          pages: list.pages.map((page) => ({
            ...page,
            notifications: update(page.notifications),
          })),
        }
      : list,
  );

  return { previousList };
};

export const restoreNotificationList = (
  queryClient: QueryClient,
  teamId: number,
  snapshot: NotificationListSnapshot | undefined,
) => {
  queryClient.setQueryData(notificationKeys.list(teamId), snapshot?.previousList);
};
