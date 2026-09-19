import { apiClient } from '@/shared/api';

import type { TeamCreditsData, TeamCreditsResponse } from '../model/types';

export const getTeamCredits = async (teamId: number): Promise<TeamCreditsData> => {
  const response = await apiClient.get<TeamCreditsResponse>(`/api/v1/teams/${teamId}/credits`);
  const result = response.data;

  if (!result.success || !result.data) {
    throw new Error('크레딧 정보를 조회하지 못했습니다.');
  }

  return result.data;
};
