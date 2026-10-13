import axios, { type InternalAxiosRequestConfig } from 'axios';
import { apiClient } from '@/shared/api';
import {
  isRedirectingToLogin,
  redirectToLoginIfRefreshRejected,
  refreshAuthTokensOnce,
} from './auth-token-refresh';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _authRetry?: boolean;
}

if (typeof window !== 'undefined') {
  apiClient.interceptors.response.use(undefined, async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest || originalRequest._authRetry || isRedirectingToLogin()) {
      return Promise.reject(error);
    }

    originalRequest._authRetry = true;

    try {
      await refreshAuthTokensOnce();
      return apiClient(originalRequest);
    } catch (refreshError) {
      redirectToLoginIfRefreshRejected(refreshError);
      return Promise.reject(refreshError);
    }
  });
}
