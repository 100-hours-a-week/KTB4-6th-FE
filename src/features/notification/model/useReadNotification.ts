'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { readNotification } from '../api/read-notification';
import {
  restoreNotificationList,
  updateNotificationListOptimistically,
} from './optimistic-notification-list';
import { notificationKeys } from './query-keys';

export const useReadNotification = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => readNotification(teamId, notificationId),
    onMutate: (notificationId) =>
      updateNotificationListOptimistically(queryClient, teamId, (notifications) =>
        notifications.map((notification) =>
          notification.notificationId === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      ),
    onError: (_error, _notificationId, snapshot) =>
      restoreNotificationList(queryClient, teamId, snapshot),
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all(teamId) }),
  });
};
