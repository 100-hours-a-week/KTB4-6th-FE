'use client';

import { useEffect, useEffectEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, usePathname } from 'next/navigation';
import {
  NOTIFICATION_SSE_EVENTS,
  notificationKeys,
  parseNotificationCreatedEvent,
  showNotificationBanner,
} from '@/features/notification';
import { refreshAuthTokensOnce } from './use-auth-retry-interceptor';

const NOTIFICATION_EVENTS_PATH = '/api/v1/notifications/events';
const NOTIFICATIONS_PAGE_PATTERN = /^\/teams\/[^/]+\/notifications$/;

export const NotificationRealtimeConnection = () => {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { teamId } = useParams<{ teamId?: string }>();

  const refreshNotifications = useEffectEvent(() => {
    if (teamId) {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all(Number(teamId)) });
    }
  });

  const receiveNotification = useEffectEvent((data: string) => {
    refreshNotifications();

    const notification = parseNotificationCreatedEvent(data);

    if (notification && !NOTIFICATIONS_PAGE_PATTERN.test(pathname)) {
      showNotificationBanner(notification);
    }
  });

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!baseUrl) {
      return;
    }

    const url = new URL(NOTIFICATION_EVENTS_PATH, baseUrl).toString();
    let source: EventSource | null = null;
    let isDisposed = false;
    let hasRetriedAfterRefresh = false;

    const connect = () => {
      const nextSource = new EventSource(url, { withCredentials: true });
      source = nextSource;

      nextSource.addEventListener(NOTIFICATION_SSE_EVENTS.connected, () => {
        hasRetriedAfterRefresh = false;
        refreshNotifications();
      });

      nextSource.addEventListener(
        NOTIFICATION_SSE_EVENTS.notificationCreated,
        (event: MessageEvent<string>) => receiveNotification(event.data),
      );

      nextSource.onerror = () => {
        if (nextSource.readyState !== EventSource.CLOSED || hasRetriedAfterRefresh) {
          return;
        }

        hasRetriedAfterRefresh = true;

        refreshAuthTokensOnce()
          .then(() => {
            if (!isDisposed) {
              connect();
            }
          })
          .catch(() => undefined);
      };
    };

    connect();

    return () => {
      isDisposed = true;
      source?.close();
    };
  }, []);

  return null;
};
