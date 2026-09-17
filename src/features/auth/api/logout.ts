import 'server-only';

import type { LogoutRequest, LogoutResponse } from '../model/types';

export const logout = async ({ accessToken, refreshToken }: LogoutRequest): Promise<void> => {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('API_BASE_URL 환경변수가 설정되지 않았습니다.');
  }

  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/v1/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken, refreshToken } satisfies LogoutRequest),
    cache: 'no-store',
  });

  if (response.status === 204) {
    return;
  }

  const result = (await response.json()) as LogoutResponse;

  if (!response.ok || !result.success) {
    throw new Error('로그아웃 API 요청에 실패했습니다.');
  }
};
