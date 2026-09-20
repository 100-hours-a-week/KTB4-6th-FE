import { apiClient } from '@/shared/api';

import { toTeamManagementApiError } from '../model/errors';
import type { UpdateTeamNameData, UpdateTeamNameResponse } from '../model/types';

export const updateTeamName = async (teamId: number, name: string): Promise<UpdateTeamNameData> => {
  try {
    const response = await apiClient.patch<UpdateTeamNameResponse>(`/api/v1/teams/${teamId}`, {
      name,
    });
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('팀 이름 변경에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    throw toTeamManagementApiError(error, '팀 이름 변경에 실패했습니다.');
  }
};
