import 'server-only';

import { getApiOnServer, ServerApiError } from '@/shared/api/index.server';
import type { ActiveRecordingData } from '../model/current-meeting-state';

export const getActiveRecordingOnServer = async (
  meetingId: number,
  accessToken: string,
): Promise<ActiveRecordingData | null> => {
  try {
    return await getApiOnServer<ActiveRecordingData>(
      `/api/v1/meetings/${meetingId}/recording`,
      accessToken,
    );
  } catch (error) {
    if (
      error instanceof ServerApiError &&
      error.status === 404 &&
      error.code === 'RECORDING_SESSION_NOT_FOUND'
    ) {
      return null;
    }
    throw error;
  }
};
