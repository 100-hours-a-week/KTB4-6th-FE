import axios from 'axios';

export class TeamManagementApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'TeamManagementApiError';
  }
}

export const toTeamManagementApiError = (
  error: unknown,
  fallbackMessage: string,
): TeamManagementApiError => {
  if (axios.isAxiosError<{ error?: { code: string; message: string } }>(error)) {
    const apiError = error.response?.data?.error;

    if (apiError) {
      return new TeamManagementApiError(apiError.code, apiError.message || fallbackMessage);
    }
  }

  return new TeamManagementApiError('UNKNOWN_ERROR', fallbackMessage);
};
