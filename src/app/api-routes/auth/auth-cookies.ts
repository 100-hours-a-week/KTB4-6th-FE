import type { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAMES } from '@/features/auth';

interface AuthCookieTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

export const setAuthCookies = (response: NextResponse, tokens: AuthCookieTokens) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;
  const accessTokenCookieOptions = {
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: tokens.accessTokenExpiresIn,
    ...(isProduction && cookieDomain ? { domain: cookieDomain } : {}),
  } as const;

  response.cookies.set(AUTH_COOKIE_NAMES.accessToken, tokens.accessToken, {
    ...accessTokenCookieOptions,
    httpOnly: true,
  });
  response.cookies.set(
    AUTH_COOKIE_NAMES.accessTokenExpiresAt,
    String(Date.now() + tokens.accessTokenExpiresIn * 1000),
    { ...accessTokenCookieOptions, httpOnly: false },
  );
  response.cookies.set(AUTH_COOKIE_NAMES.refreshToken, tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: tokens.refreshTokenExpiresIn,
  });
};

export const hasAccessTokenCookie = (cookieStore: { has: (name: string) => boolean }) =>
  cookieStore.has(AUTH_COOKIE_NAMES.accessToken);

export const clearAuthCookies = (response: NextResponse) => {
  setAuthCookies(response, {
    accessToken: '',
    refreshToken: '',
    accessTokenExpiresIn: 0,
    refreshTokenExpiresIn: 0,
  });
};
