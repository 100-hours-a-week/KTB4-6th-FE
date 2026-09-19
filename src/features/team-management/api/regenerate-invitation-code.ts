import { apiClient } from '@/shared/api';

import type { InvitationCodeData, RegenerateInvitationCodeResponse } from '../model/types';

export class RegenerateInvitationCodeApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'RegenerateInvitationCodeApiError';
  }
}

export const regenerateInvitationCode = async (teamId: number): Promise<InvitationCodeData> => {
  const response = await apiClient.post<RegenerateInvitationCodeResponse>(
    `/api/v1/teams/${teamId}/invitation-codes`,
  );
  const result = response.data;

  if (!result.success || !result.data) {
    throw new RegenerateInvitationCodeApiError(
      result.error?.code ?? 'UNKNOWN_ERROR',
      result.error?.message ?? '초대 코드 재생성에 실패했습니다.',
    );
  }

  return result.data;
};
