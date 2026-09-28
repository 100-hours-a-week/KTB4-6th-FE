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

/**
 * apiClient 생성 직후, 모듈이 로드되는 시점에 바로 등록한다.
 * React 컴포넌트의 useEffect 안에서 등록하면 자식 컴포넌트의 effect(예: 첫 화면의 데이터 조회)가
 * 부모보다 먼저 실행돼, 새로고침 직후 가장 먼저 나가는 요청은 인터셉터 등록 전에 401을 받고
 * 재발급 시도 없이 그대로 실패할 수 있다.
 */
if (typeof window !== 'undefined') {
  apiClient.interceptors.response.use(undefined, async (error: unknown) => {
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
}
