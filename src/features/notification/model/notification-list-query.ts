import { infiniteQueryOptions } from '@tanstack/react-query';
import { getNotifications } from '../api/get-notifications';
import { notificationKeys } from './query-keys';

export const notificationListQueryOptions = (teamId: number) =>
  infiniteQueryOptions({
    queryKey: notificationKeys.list(teamId),
    queryFn: ({ pageParam }) => getNotifications(pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.nextCursor !== null ? lastPage.nextCursor : undefined,
  });
