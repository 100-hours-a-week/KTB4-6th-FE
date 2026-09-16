'use client';

import { useState } from 'react';
import { getActiveTeam } from '../api/get-active-team';

export const useStartTeamSpace = (onNoActiveTeam: () => void) => {
  const [isCheckingActiveTeam, setIsCheckingActiveTeam] = useState(false);
  const [activeTeamError, setActiveTeamError] = useState<string | null>(null);

  const startTeamSpace = async () => {
    if (isCheckingActiveTeam) return;

    setIsCheckingActiveTeam(true);
    setActiveTeamError(null);

    try {
      const activeTeam = await getActiveTeam();

      if (activeTeam.hasActiveTeam) {
        // TODO: 홈 페이지 구현 시 GET /api/v1/home/{teamId} 조회 후
        // /teams/{teamId}로 이동합니다. teamId는 activeTeam.teamId를 사용합니다.
        return;
      }

      onNoActiveTeam();
    } catch {
      setActiveTeamError('팀 스페이스 정보를 불러오지 못했습니다.');
    } finally {
      setIsCheckingActiveTeam(false);
    }
  };

  return { isCheckingActiveTeam, activeTeamError, startTeamSpace };
};
