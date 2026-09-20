import { apiClient } from '@/shared/api';

import { toTeamManagementApiError } from '../model/errors';

export const deleteTeam = async (teamId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/v1/teams/${teamId}`);
  } catch (error) {
    throw toTeamManagementApiError(error, '팀 삭제에 실패했습니다.');
  }
};
