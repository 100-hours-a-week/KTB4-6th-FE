import axios from 'axios';

/** 녹음 시작 요청이 팀 크레딧 부족(409 INSUFFICIENT_CREDIT)으로 실패했는지 판별한다. */
export const isInsufficientCreditError = (error: unknown) =>
  axios.isAxiosError<{ error?: { code?: string } | null }>(error) &&
  error.response?.status === 409 &&
  error.response.data?.error?.code === 'INSUFFICIENT_CREDIT';
