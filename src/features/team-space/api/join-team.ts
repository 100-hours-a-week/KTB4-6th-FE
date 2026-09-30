import { apiClient } from '@/shared/api';

import { toTeamSpaceApiError } from '../model/errors';
import type { JoinTeamData, JoinTeamRequest, JoinTeamResponse } from '../model/types';

export const joinTeam = async (request: JoinTeamRequest): Promise<JoinTeamData> => {
  try {
    const response = await apiClient.post<JoinTeamResponse>('/api/v1/team-memberships', request);
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('팀 스페이스 참여에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    throw toTeamSpaceApiError(error, '팀 스페이스 참여에 실패했습니다.');
  }
};
