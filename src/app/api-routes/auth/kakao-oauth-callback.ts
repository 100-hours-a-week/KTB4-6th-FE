import { type NextRequest, NextResponse } from 'next/server';
import { oauthLogin } from '@/features/auth/index.server';
import { setAuthCookies } from './auth-cookies';

export const kakaoOAuthCallback = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error !== null || errorDescription !== null) {
    return redirectWithOAuthError(error === 'access_denied' ? 'cancelled' : 'failed');
  }

  if (!code) {
    return redirectWithOAuthError('failed');
  }

  try {
    const authData = await oauthLogin({
      provider: 'kakao',
      authorizationCode: code,
    });
    const response = new NextResponse(null, {
      status: 303,
      headers: {
        Location: '/',
      },
    });
    setAuthCookies(response, authData);

    return response;
  } catch {
    return redirectWithOAuthError('failed');
  }
};

const redirectWithOAuthError = (error: 'cancelled' | 'failed') =>
  createSameOriginRedirect(`/?loginError=${error}`);

const createSameOriginRedirect = (location: string) =>
  new NextResponse(null, {
    status: 303,
    headers: {
      Location: location,
    },
  });
