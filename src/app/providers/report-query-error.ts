import axios from 'axios';
import * as Sentry from '@sentry/nextjs';
import type { QueryKey } from '@tanstack/react-query';

interface ApiErrorResponse {
  error?: { code?: string } | null;
}

/**
 * 5xx·네트워크 오류와 응답 형식 오류처럼 서비스 장애로 볼 수 있는 오류만 보고한다.
 * 401(재발급 인터셉터가 처리), 403·404, 업무 규칙 위반(409 등)처럼 서버가 의도해서 내려준
 * 4xx 응답과 요청 취소는 화면에서 처리하는 예상된 실패라 제외한다.
 */
const shouldReport = (error: unknown) => {
  if (axios.isCancel(error)) return false;
  if (!axios.isAxiosError(error)) return true;

  const status = error.response?.status;
  return status === undefined || status >= 500;
};

export const reportQueryError = (
  error: unknown,
  operation: { type: 'query' | 'mutation'; key?: QueryKey },
) => {
  if (!shouldReport(error)) return;

  Sentry.withScope((scope) => {
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

    Sentry.captureException(error);
  });
};
