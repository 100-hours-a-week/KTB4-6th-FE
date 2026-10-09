'use client';

import { useRouter } from 'next/navigation';
import { getNotificationHref } from './get-notification-href';
import type { NotificationData } from './types';
import { useReadNotification } from './useReadNotification';

export const useOpenNotification = (teamId: number) => {
  const router = useRouter();
  const { mutate: readNotification } = useReadNotification(teamId);

  return (notification: NotificationData) => {
    if (!notification.isRead) {
      readNotification(notification.notificationId);
    }

    const href = getNotificationHref(teamId, notification);

    if (href) {
      router.push(href);
    }
  };
};
