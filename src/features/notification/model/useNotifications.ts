'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { notificationListQueryOptions } from './notification-list-query';

export const useNotifications = (teamId: number) =>
  useInfiniteQuery(notificationListQueryOptions(teamId));
