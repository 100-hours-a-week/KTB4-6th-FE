import axios from 'axios';
import { getAccessTokenExpiresAt, requestTokenRefresh } from '@/features/auth';

const AUTH_REFRESH_LOCK = 'auth-token-refresh';
export const AUTH_REFRESH_LEAD_MS = 2 * 60 * 1000;

let refreshPromise: Promise<void> | null = null;
let isRedirecting = false;

const refreshUnlessRefreshedElsewhere = async () => {
  const expiresAtBeforeLock = getAccessTokenExpiresAt();

  if (!('locks' in navigator)) {
    await requestTokenRefresh();
    return;
  }

  await navigator.locks.request(AUTH_REFRESH_LOCK, async () => {
    if (getAccessTokenExpiresAt() !== expiresAtBeforeLock) return;
    await requestTokenRefresh();
  });
};

export const refreshAuthTokensOnce = () => {
  if (!refreshPromise) {
    refreshPromise = refreshUnlessRefreshedElsewhere().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const ensureFreshAuthTokens = async () => {
  const expiresAt = getAccessTokenExpiresAt();
  if (expiresAt !== null && expiresAt - Date.now() > AUTH_REFRESH_LEAD_MS) return;

  await refreshAuthTokensOnce();
};

export const isRedirectingToLogin = () => isRedirecting;

export const redirectToLoginIfRefreshRejected = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && !isRedirecting) {
    isRedirecting = true;
    window.location.replace('/');
  }
};
