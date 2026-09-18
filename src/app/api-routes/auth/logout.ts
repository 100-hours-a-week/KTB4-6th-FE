import { type NextRequest, NextResponse } from 'next/server';
import { logout } from '@/features/auth/index.server';

export const logoutHandler = async (request: NextRequest) => {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!accessToken || !refreshToken) {
    const response = NextResponse.json(
      { success: false, error: '인증 정보가 없어 로그아웃할 수 없습니다.' },
      { status: 401 },
    );
    return response;
  }

  try {
    await logout({ accessToken, refreshToken });

    const response = NextResponse.json({ success: true });
    clearAuthCookies(response);
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: '로그아웃에 실패했습니다. 다시 시도해 주세요.' },
      { status: 502 },
    );
  }
};

// 브라우저에 있는 쿠키 삭제
const clearAuthCookies = (response: NextResponse) => {
  const isProduction = process.env.NODE_ENV === 'production';

  response.cookies.set('accessToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    ...(isProduction ? { domain: 'meety.kro.kr' } : {}),
  });
  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 0,
  });
};
