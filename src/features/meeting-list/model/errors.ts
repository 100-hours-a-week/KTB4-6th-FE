import axios from 'axios';

export class MeetingListApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'MeetingListApiError';
  }
}

export const toMeetingListApiError = (
  error: unknown,
  fallbackMessage: string,
): MeetingListApiError => {
  if (axios.isAxiosError<{ error?: { code: string; message: string } }>(error)) {
    const apiError = error.response?.data?.error;

    if (apiError) {
      return new MeetingListApiError(apiError.code, apiError.message || fallbackMessage);
    }
  }

  return new MeetingListApiError('UNKNOWN_ERROR', fallbackMessage);
};
