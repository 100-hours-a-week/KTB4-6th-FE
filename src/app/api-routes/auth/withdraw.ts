import { type NextRequest, NextResponse } from 'next/server';
import { withdrawAccount, WithdrawAccountApiError } from '@/features/auth/index.server';
import { clearAuthCookies } from './auth-cookies';

export const withdrawHandler = async (request: NextRequest) => {
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: '인증 정보가 없어 탈퇴할 수 없습니다.' },
      { status: 401 },
    );
  }

  try {
    await withdrawAccount(accessToken);

    const response = NextResponse.json({ success: true });
    clearAuthCookies(response);
    return response;
  } catch (error) {
    if (error instanceof WithdrawAccountApiError && error.status === 401) {
      return NextResponse.json(
        { success: false, error: '인증이 만료되었습니다.' },
        { status: 401 },
      );
    }

    if (error instanceof WithdrawAccountApiError && error.status >= 400 && error.status < 500) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { success: false, error: '회원 탈퇴에 실패했습니다. 다시 시도해 주세요.' },
      { status: 502 },
    );
  }
};
