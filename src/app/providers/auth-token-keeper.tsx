'use client';

import { useEffect } from 'react';
import { getAccessTokenExpiresAt } from '@/features/auth';
import {
  AUTH_REFRESH_LEAD_MS,
  redirectToLoginIfRefreshRejected,
  refreshAuthTokensOnce,
} from './auth-token-refresh';

const REFRESH_RETRY_DELAY_MS = 60 * 1000;

const getDelayUntilRefresh = () => {
  const expiresAt = getAccessTokenExpiresAt();
  return expiresAt === null ? 0 : expiresAt - AUTH_REFRESH_LEAD_MS - Date.now();
};

export const AuthTokenKeeper = () => {
  useEffect(() => {
    let timeoutId: number | undefined;
    let isDisposed = false;

    const schedule = (delay: number) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(refresh, Math.max(delay, 0));
    };

    const refresh = () => {
      refreshAuthTokensOnce()
        .then(() => {
          if (!isDisposed) schedule(Math.max(getDelayUntilRefresh(), REFRESH_RETRY_DELAY_MS));
        })
        .catch((error: unknown) => {
          if (isDisposed) return;
          redirectToLoginIfRefreshRejected(error);
          schedule(REFRESH_RETRY_DELAY_MS);
        });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') schedule(getDelayUntilRefresh());
    };

    schedule(getDelayUntilRefresh());
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isDisposed = true;
      window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
};
