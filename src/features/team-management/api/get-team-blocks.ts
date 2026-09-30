import { apiClient } from '@/shared/api';

import { toTeamManagementApiError } from '../model/errors';
import type { BlockedMemberData, TeamBlocksResponse } from '../model/types';

export const getTeamBlocks = async (teamId: number): Promise<BlockedMemberData[]> => {
  try {
    const response = await apiClient.get<TeamBlocksResponse>(`/api/v1/teams/${teamId}/blocks`);
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('차단 목록을 조회하지 못했습니다.');
    }

    return result.data.blocks;
  } catch (error) {
    throw toTeamManagementApiError(error, '차단 목록을 조회하지 못했습니다.');
  }
};
