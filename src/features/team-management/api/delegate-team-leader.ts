import { apiClient } from '@/shared/api';

import { toTeamManagementApiError } from '../model/errors';

export const delegateTeamLeader = async (teamId: number, teamMemberId: number): Promise<void> => {
  try {
    // 스펙(2.10)에 요청 바디 키가 대문자로 시작하는 `TeamMemberId`로 명시돼 있어 그대로 따른다.
    await apiClient.put(`/api/v1/teams/${teamId}/leader`, { TeamMemberId: teamMemberId });
  } catch (error) {
    throw toTeamManagementApiError(error, '팀장 권한 위임에 실패했습니다.');
  }
};
