import { type NextRequest, NextResponse } from 'next/server';
import { oauthLogin } from '@/features/auth/api/oauth-login';

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error !== null || errorDescription !== null) {
    return redirectWithOAuthError(request);
  }

  if (!code) {
    return redirectWithOAuthError(request);
  }

  try {
    await oauthLogin({
      provider: 'kakao',
      authorizationCode: code,
    });

    return NextResponse.redirect(new URL('/', request.url));
  } catch {
    return redirectWithOAuthError(request);
  }
};

const redirectWithOAuthError = (request: NextRequest) => {
  const redirectUrl = new URL('/', request.url);
  redirectUrl.searchParams.set('error', 'oauth');

  return NextResponse.redirect(redirectUrl);
};
