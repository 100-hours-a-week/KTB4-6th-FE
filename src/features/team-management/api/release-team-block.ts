import { apiClient } from '@/shared/api';

import { toTeamManagementApiError } from '../model/errors';

export const releaseTeamBlock = async (teamId: number, blockId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/v1/teams/${teamId}/blocks/${blockId}`);
  } catch (error) {
    throw toTeamManagementApiError(error, '차단 해제에 실패했습니다.');
  }
};
