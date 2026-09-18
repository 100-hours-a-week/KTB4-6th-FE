import 'server-only';

import type { TokenRefreshData, TokenRefreshRequest, TokenRefreshResponse } from '../model/types';

export const refreshAuthTokens = async ({
  refreshToken,
}: TokenRefreshRequest): Promise<TokenRefreshData> => {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('API_BASE_URL 환경변수가 설정되지 않았습니다.');
  }

  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/v1/auth/token/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken } satisfies TokenRefreshRequest),
    cache: 'no-store',
  });
  const result = (await response.json()) as TokenRefreshResponse;

  if (!response.ok || !result.success || !result.data) {
    throw new Error('토큰 재발급 API 요청에 실패했습니다.');
  }

  return result.data;
};
