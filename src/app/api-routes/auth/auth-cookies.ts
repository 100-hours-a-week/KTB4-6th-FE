import type { NextResponse } from 'next/server';

interface AuthCookieTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

export const setAuthCookies = (response: NextResponse, tokens: AuthCookieTokens) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;

  response.cookies.set('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: tokens.accessTokenExpiresIn,
    ...(isProduction && cookieDomain ? { domain: cookieDomain } : {}),
  });
  response.cookies.set('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: tokens.refreshTokenExpiresIn,
  });
};

export const clearAuthCookies = (response: NextResponse) => {
  setAuthCookies(response, {
    accessToken: '',
    refreshToken: '',
    accessTokenExpiresIn: 0,
    refreshTokenExpiresIn: 0,
  });
};
