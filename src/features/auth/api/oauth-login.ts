import 'server-only';

import type {
  OAuthLoginData,
  OAuthLoginRequest,
  OAuthLoginResponse,
  OAuthProvider,
} from '../model/types';

interface OAuthLoginParams extends OAuthLoginRequest {
  provider: OAuthProvider;
}

export const oauthLogin = async ({
  provider,
  authorizationCode,
}: OAuthLoginParams): Promise<OAuthLoginData> => {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('API_BASE_URL 환경변수가 설정되지 않았습니다.');
  }

  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/v1/auth/${provider}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ authorizationCode } satisfies OAuthLoginRequest),
    cache: 'no-store',
  });
  const result = (await response.json()) as OAuthLoginResponse;

  if (!response.ok || !result.success || !result.data) {
    throw new Error('OAuth 로그인 API 요청에 실패했습니다.');
  }

  return result.data;
};
