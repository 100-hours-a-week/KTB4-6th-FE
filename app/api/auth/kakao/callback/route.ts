import { type NextRequest, NextResponse } from 'next/server';
import { oauthLogin } from '@/features/auth/api/oauth-login';

export const GET = async (request: NextRequest) => {
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
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set('accessToken', authData.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: authData.accessTokenExpiresIn,
      ...(isProduction ? { domain: 'meety.kro.kr' } : {}),
    });
    response.cookies.set('refreshToken', authData.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: authData.refreshTokenExpiresIn,
    });

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
