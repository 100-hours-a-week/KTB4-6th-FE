'use client';

import { useState } from 'react';
import { getActiveTeam } from '../api/get-active-team';

interface UseStartTeamSpaceOptions {
  onActiveTeam: () => Promise<void>;
  onNoActiveTeam: () => void;
}

export const useStartTeamSpace = ({ onActiveTeam, onNoActiveTeam }: UseStartTeamSpaceOptions) => {
  const [isCheckingActiveTeam, setIsCheckingActiveTeam] = useState(false);
  const [activeTeamError, setActiveTeamError] = useState<string | null>(null);

  const startTeamSpace = async () => {
    if (isCheckingActiveTeam) return;

    setIsCheckingActiveTeam(true);
    setActiveTeamError(null);

    try {
      const activeTeam = await getActiveTeam();

      if (activeTeam.hasActiveTeam) {
        await onActiveTeam();
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
