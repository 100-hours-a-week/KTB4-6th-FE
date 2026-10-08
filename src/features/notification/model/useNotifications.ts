'use client';

import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '../api/get-notifications';
import { notificationKeys } from './query-keys';

export const useNotifications = (teamId: number) =>
  useQuery({
    queryKey: notificationKeys.list(teamId),
    queryFn: () => getNotifications(teamId),
  });
