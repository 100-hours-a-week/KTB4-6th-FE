import axios from 'axios';

export class TeamSpaceApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'TeamSpaceApiError';
  }
}

export const toTeamSpaceApiError = (error: unknown, fallbackMessage: string): TeamSpaceApiError => {
  if (axios.isAxiosError<{ error?: { code: string; message: string } }>(error)) {
    const apiError = error.response?.data?.error;

    if (apiError) {
      return new TeamSpaceApiError(apiError.code, apiError.message || fallbackMessage);
    }
  }

  return new TeamSpaceApiError('UNKNOWN_ERROR', fallbackMessage);
};
