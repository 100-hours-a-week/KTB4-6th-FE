import { apiClient } from '@/shared/api';

import { toTeamManagementApiError } from '../model/errors';
import type { InvitationCodeData, RegenerateInvitationCodeResponse } from '../model/types';

export const regenerateInvitationCode = async (teamId: number): Promise<InvitationCodeData> => {
  try {
    const response = await apiClient.post<RegenerateInvitationCodeResponse>(
      `/api/v1/teams/${teamId}/invitation-codes`,
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('초대 코드 재생성에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    throw toTeamManagementApiError(error, '초대 코드 재생성에 실패했습니다.');
  }
};
