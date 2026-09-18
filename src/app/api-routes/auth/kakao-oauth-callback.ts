import { type NextRequest, NextResponse } from 'next/server';
import { oauthLogin } from '@/features/auth/index.server';
import { setAuthCookies } from './auth-cookies';

export const kakaoOAuthCallback = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error !== null || errorDescription !== null) {
    return redirectWithOAuthError(request, error === 'access_denied' ? 'cancelled' : 'failed');
  }

  if (!code) {
    return redirectWithOAuthError(request, 'failed');
  }

  try {
    const authData = await oauthLogin({
      provider: 'kakao',
      authorizationCode: code,
    });
    const response = NextResponse.redirect(new URL('/', request.url));
    setAuthCookies(response, authData);

    return response;
  } catch {
    return redirectWithOAuthError(request, 'failed');
  }
};

const redirectWithOAuthError = (request: NextRequest, error: 'cancelled' | 'failed') => {
  const redirectUrl = new URL('/', request.url);
  redirectUrl.searchParams.set('loginError', error);

  return NextResponse.redirect(redirectUrl);
};
