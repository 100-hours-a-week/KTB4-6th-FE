import axios from 'axios';
import { withScope } from '@/shared/lib';
import type { QueryKey } from '@tanstack/react-query';

interface ApiErrorResponse {
  error?: { code?: string } | null;
}

const getResponseStatus = (error: unknown) => {
  if (axios.isAxiosError(error)) return error.response?.status;
  if (error instanceof Error && 'status' in error && typeof error.status === 'number') {
    return error.status;
  }
  return undefined;
};

const shouldReport = (error: unknown) => {
  if (axios.isCancel(error)) return false;

  const status = getResponseStatus(error);
  return status === undefined || status >= 500;
};

export const reportQueryError = (
  error: unknown,
  operation: { type: 'query' | 'mutation'; key?: QueryKey },
) => {
  if (!shouldReport(error)) return;

  withScope((scope) => {
    scope.setTag('query.type', operation.type);
    if (operation.key) scope.setContext('query', { key: JSON.stringify(operation.key) });

    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      // 쿼리 문자열에는 검색어 등 사용자 입력이 들어갈 수 있어 경로만 남긴다.
      const path = error.config?.url?.split('?')[0];

      scope.setTag('api.method', error.config?.method?.toUpperCase() ?? 'UNKNOWN');
      scope.setTag('api.status', error.response?.status ?? 'network');
      if (path) scope.setTag('api.path', path);

      const code = error.response?.data?.error?.code;
      if (code) scope.setTag('api.error_code', code);
    }

    scope.captureException(error);
  });
};
