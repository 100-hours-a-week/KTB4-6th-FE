'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNotification } from '../api/delete-notification';
import {
  restoreNotificationList,
  updateNotificationListOptimistically,
} from './optimistic-notification-list';
import { notificationKeys } from './query-keys';

export const useDeleteNotification = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => deleteNotification(teamId, notificationId),
    onMutate: (notificationId) =>
      updateNotificationListOptimistically(queryClient, teamId, (notifications) =>
        notifications.filter((notification) => notification.notificationId !== notificationId),
      ),
    onError: (_error, _notificationId, snapshot) =>
      restoreNotificationList(queryClient, teamId, snapshot),
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all(teamId) }),
  });
};
