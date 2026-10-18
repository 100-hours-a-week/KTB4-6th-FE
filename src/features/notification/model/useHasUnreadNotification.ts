'use client';

import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { notificationListQueryOptions } from './notification-list-query';
import type { NotificationListData } from './types';

const hasUnreadNotification = (list: InfiniteData<NotificationListData>) =>
  (list.pages[0]?.unreadCount ?? 0) > 0;

export const useHasUnreadNotification = (teamId: number) => {
  const { data: hasUnread = false } = useInfiniteQuery({
    ...notificationListQueryOptions(teamId),
    select: hasUnreadNotification,
  });

  return hasUnread;
};
