import { type NextRequest, NextResponse } from 'next/server';
import { refreshAuthTokens, TokenRefreshApiError } from '@/features/auth/index.server';
import { clearAuthCookies, setAuthCookies } from './auth-cookies';

export const refreshTokensHandler = async (request: NextRequest) => {
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    const response = NextResponse.json(
      { success: false, error: '인증 정보가 없어 토큰을 재발급할 수 없습니다.' },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  try {
    const authData = await refreshAuthTokens({ refreshToken });
    const response = NextResponse.json({ success: true });
    setAuthCookies(response, authData);
    return response;
  } catch (error) {
    if (error instanceof TokenRefreshApiError && error.status === 401) {
      const response = NextResponse.json(
        { success: false, error: '인증이 만료되었습니다. 다시 로그인해 주세요.' },
        { status: 401 },
      );
      clearAuthCookies(response);
      return response;
    }

    return NextResponse.json(
      { success: false, error: '토큰 재발급에 실패했습니다. 다시 시도해 주세요.' },
      { status: 502 },
    );
  }
};
