import { apiClient } from '@/shared/api';

import { toTeamSpaceApiError } from '../model/errors';
import type { CreateTeamData, CreateTeamRequest, CreateTeamResponse } from '../model/types';

export const createTeam = async (request: CreateTeamRequest): Promise<CreateTeamData> => {
  try {
    const response = await apiClient.post<CreateTeamResponse>('/api/v1/teams', request);
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('팀 스페이스 생성에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    throw toTeamSpaceApiError(error, '팀 스페이스 생성에 실패했습니다.');
  }
};
