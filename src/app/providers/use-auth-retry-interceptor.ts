import { useEffect } from 'react';
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { requestTokenRefresh } from '@/features/auth';
import { apiClient } from '@/shared/api';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _authRetry?: boolean;
}

let refreshPromise: Promise<void> | null = null;
let isRedirecting = false;

const refreshOnce = () => {
  if (!refreshPromise) {
    refreshPromise = requestTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const useAuthRetryInterceptor = () => {
  useEffect(() => {
    const interceptorId = apiClient.interceptors.response.use(undefined, async (error: unknown) => {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        return Promise.reject(error);
      }

      const originalRequest = error.config as RetryableRequestConfig | undefined;

      if (!originalRequest || originalRequest._authRetry || isRedirecting) {
        return Promise.reject(error);
      }

      originalRequest._authRetry = true;

      try {
        await refreshOnce();
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (
          axios.isAxiosError(refreshError) &&
          refreshError.response?.status === 401 &&
          !isRedirecting
        ) {
          isRedirecting = true;
          window.location.replace('/');
        }

        return Promise.reject(refreshError);
      }
    });

    return () => apiClient.interceptors.response.eject(interceptorId);
  }, []);
};
