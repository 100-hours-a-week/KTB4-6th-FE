import { apiClient } from '@/shared/api';

import { toTeamManagementApiError } from '../model/errors';
import type { TeamMemberData, TeamMembersResponse } from '../model/types';

export const getTeamMembers = async (teamId: number): Promise<TeamMemberData[]> => {
  try {
    const response = await apiClient.get<TeamMembersResponse>(`/api/v1/teams/${teamId}/members`);
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('팀원 목록을 조회하지 못했습니다.');
    }

    return result.data.members;
  } catch (error) {
    throw toTeamManagementApiError(error, '팀원 목록을 조회하지 못했습니다.');
  }
};
