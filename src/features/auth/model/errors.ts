import axios from 'axios';

export class WithdrawApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'WithdrawApiError';
  }
}

export const toWithdrawApiError = (error: unknown): WithdrawApiError => {
  const fallbackMessage = '회원 탈퇴에 실패했습니다.';

  if (axios.isAxiosError<{ error?: { code: string; message: string } }>(error)) {
    const apiError = error.response?.data?.error;

    if (apiError) {
      return new WithdrawApiError(apiError.code, apiError.message || fallbackMessage);
    }
  }

  return new WithdrawApiError('UNKNOWN_ERROR', fallbackMessage);
};
