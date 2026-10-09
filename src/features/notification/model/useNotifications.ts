'use client';

import { useQuery } from '@tanstack/react-query';
import { notificationListQueryOptions } from './notification-list-query';

export const useNotifications = (teamId: number) => useQuery(notificationListQueryOptions(teamId));
