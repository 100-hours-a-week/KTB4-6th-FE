import axios from 'axios';

export class MeetingApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'MeetingApiError';
  }
}

export const toMeetingApiError = (error: unknown, fallbackMessage: string): MeetingApiError => {
  if (axios.isAxiosError<{ error?: { code: string; message: string } }>(error)) {
    const apiError = error.response?.data?.error;

    if (apiError) {
      return new MeetingApiError(apiError.code, apiError.message || fallbackMessage);
    }
  }

  return new MeetingApiError('UNKNOWN_ERROR', fallbackMessage);
};
