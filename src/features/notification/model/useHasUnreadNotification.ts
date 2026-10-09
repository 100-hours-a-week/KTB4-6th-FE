'use client';

import { useQuery } from '@tanstack/react-query';
import { notificationListQueryOptions } from './notification-list-query';
import type { NotificationData } from './types';

const hasUnreadNotification = (notifications: NotificationData[]) =>
  notifications.some((notification) => !notification.isRead);

export const useHasUnreadNotification = (teamId: number) => {
  const { data: hasUnread = false } = useQuery({
    ...notificationListQueryOptions(teamId),
    select: hasUnreadNotification,
  });

  return hasUnread;
};
