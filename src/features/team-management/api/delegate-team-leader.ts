import { apiClient } from '@/shared/api';

import { toTeamManagementApiError } from '../model/errors';

export const delegateTeamLeader = async (teamId: number, teamMemberId: number): Promise<void> => {
  try {
    await apiClient.put(`/api/v1/teams/${teamId}/leader`, { teamMemberId: teamMemberId });
  } catch (error) {
    throw toTeamManagementApiError(error, '팀장 권한 위임에 실패했습니다.');
  }
};
