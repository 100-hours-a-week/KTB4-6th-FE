import axios from 'axios';

export class MeetingApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    /** 서버가 응답했을 때의 HTTP 상태 코드. 응답을 받지 못한 네트워크 오류면 없음 */
    readonly status?: number,
  ) {
    super(message);
    this.name = 'MeetingApiError';
  }
}

export const toMeetingApiError = (error: unknown, fallbackMessage: string): MeetingApiError => {
  if (axios.isAxiosError<{ error?: { code: string; message: string } }>(error)) {
    const apiError = error.response?.data?.error;

    if (apiError) {
      return new MeetingApiError(
        apiError.code,
        apiError.message || fallbackMessage,
        error.response?.status,
      );
    }
  }

  return new MeetingApiError('UNKNOWN_ERROR', fallbackMessage);
};
