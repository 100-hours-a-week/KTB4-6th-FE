import { apiClient } from '@/shared/api';

import type { ActiveTeamData, ActiveTeamResponse } from '../model/types';

export const getActiveTeam = async (): Promise<ActiveTeamData> => {
  const response = await apiClient.get<ActiveTeamResponse>('/api/v1/teams/me');
  const result = response.data;

  if (!result.success || !result.data) {
    throw new Error('팀 스페이스 소속 여부 조회에 실패했습니다.');
  }

  return result.data;
};
