import { apiClient } from '@/shared/api';

import { toTeamManagementApiError } from '../model/errors';
import type { TeamDetailData, TeamDetailResponse } from '../model/types';

export const getTeamDetail = async (teamId: number): Promise<TeamDetailData> => {
  try {
    const response = await apiClient.get<TeamDetailResponse>(`/api/v1/teams/${teamId}`);
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('팀 정보를 조회하지 못했습니다.');
    }

    return result.data;
  } catch (error) {
    throw toTeamManagementApiError(error, '팀 정보를 조회하지 못했습니다.');
  }
};
