import { queryOptions } from '@tanstack/react-query';
import { getNotifications } from '../api/get-notifications';
import { notificationKeys } from './query-keys';

export const notificationListQueryOptions = (teamId: number) =>
  queryOptions({
    queryKey: notificationKeys.list(teamId),
    queryFn: () => getNotifications(teamId),
  });
