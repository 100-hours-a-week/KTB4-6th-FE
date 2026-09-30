import { apiClient } from '@/shared/api';

import { toTeamManagementApiError } from '../model/errors';

export const kickTeamMember = async (teamId: number, teamMemberId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/v1/teams/${teamId}/members/${teamMemberId}`);
  } catch (error) {
    throw toTeamManagementApiError(error, '사용자 강퇴에 실패했습니다.');
  }
};
