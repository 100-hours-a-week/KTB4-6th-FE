import { type NextRequest, NextResponse } from 'next/server';
import { hasAccessTokenCookie } from '@/app/api-routes';

export function proxy(request: NextRequest) {
  if (hasAccessTokenCookie(request.cookies)) return NextResponse.next();

  return NextResponse.redirect(new URL('/?authRequired=1', request.url));
}

export const config = {
  matcher: '/teams/:path*',
};
