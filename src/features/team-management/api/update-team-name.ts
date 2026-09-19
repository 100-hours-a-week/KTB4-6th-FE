import { apiClient } from '@/shared/api';

import type { UpdateTeamNameData, UpdateTeamNameResponse } from '../model/types';

export const updateTeamName = async (teamId: number, name: string): Promise<UpdateTeamNameData> => {
  const response = await apiClient.patch<UpdateTeamNameResponse>(`/api/v1/teams/${teamId}`, {
    name,
  });
  const result = response.data;

  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? '팀 이름 변경에 실패했습니다.');
  }

  return result.data;
};
