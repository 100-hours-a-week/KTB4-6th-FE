'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { readAllNotifications } from '../api/read-all-notifications';
import {
  restoreNotificationList,
  updateNotificationListOptimistically,
} from './optimistic-notification-list';
import { notificationKeys } from './query-keys';

export const useReadAllNotifications = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => readAllNotifications(),
    onMutate: () =>
      updateNotificationListOptimistically(queryClient, teamId, (notifications) =>
        notifications.map((notification) => ({ ...notification, isRead: true })),
      ),
    onError: (_error, _variables, snapshot) =>
      restoreNotificationList(queryClient, teamId, snapshot),
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all(teamId) }),
  });
};
