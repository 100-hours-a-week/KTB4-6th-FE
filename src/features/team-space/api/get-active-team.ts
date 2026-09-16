import axios from 'axios';

import type { ActiveTeamData, ActiveTeamResponse } from '../model/types';

export const getActiveTeam = async (): Promise<ActiveTeamData> => {
  // API 명세 확정 후 팀 소속 여부 조회 주소를 이 환경변수에 연결합니다.
  const endpoint = process.env.NEXT_PUBLIC_ACTIVE_TEAM_API_URL;

  if (!endpoint) {
    throw new Error('NEXT_PUBLIC_ACTIVE_TEAM_API_URL 환경변수가 설정되지 않았습니다.');
  }

  const response = await axios.get<ActiveTeamResponse>(endpoint, {
    withCredentials: true,
  });
  const result = response.data;

  if (!result.success || !result.data) {
    throw new Error('팀 스페이스 소속 여부 조회에 실패했습니다.');
  }

  return result.data;
};
