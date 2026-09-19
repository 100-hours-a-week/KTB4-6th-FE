import { apiClient } from '@/shared/api';

import { toTeamManagementApiError } from '../model/errors';

export const leaveTeam = async (teamId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/v1/teams/${teamId}/members/me`);
  } catch (error) {
    throw toTeamManagementApiError(error, '팀 나가기에 실패했습니다.');
  }
};
