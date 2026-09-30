import 'server-only';

export class WithdrawAccountApiError extends Error {
  constructor(readonly status: number) {
    super('회원 탈퇴 API 요청에 실패했습니다.');
    this.name = 'WithdrawAccountApiError';
  }
}

export const withdrawAccount = async (accessToken: string): Promise<void> => {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('API_BASE_URL 환경변수가 설정되지 않았습니다.');
  }

  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/v1/users/me`, {
    method: 'DELETE',
    headers: {
      Cookie: `accessToken=${accessToken}`,
    },
    cache: 'no-store',
  });

  if (response.status === 204) {
    return;
  }

  if (!response.ok) {
    throw new WithdrawAccountApiError(response.status);
  }
};
