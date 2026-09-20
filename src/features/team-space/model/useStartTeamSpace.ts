'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getActiveTeam } from '../api/get-active-team';
import { teamSpaceKeys } from './query-keys';

interface UseStartTeamSpaceOptions {
  isEnabled: boolean;
  onActiveTeam: () => Promise<void>;
  onNoActiveTeam: () => void;
}

export const useStartTeamSpace = ({
  isEnabled,
  onActiveTeam,
  onNoActiveTeam,
}: UseStartTeamSpaceOptions) => {
  const activeTeamQuery = useQuery({
    queryKey: teamSpaceKeys.activeTeam,
    queryFn: getActiveTeam,
    enabled: isEnabled,
  });
  const [isStarting, setIsStarting] = useState(false);
  const [hasStartError, setHasStartError] = useState(false);

  const isCheckingActiveTeam = (activeTeamQuery.isFetching && !activeTeamQuery.data) || isStarting;
  const hasError = activeTeamQuery.isError || hasStartError;

  const startTeamSpace = async () => {
    if (isCheckingActiveTeam) return;

    const activeTeam = activeTeamQuery.data ?? (await activeTeamQuery.refetch()).data;

    if (!activeTeam) return;

    if (!activeTeam.hasActiveTeam) {
      onNoActiveTeam();
      return;
    }

    setIsStarting(true);
    setHasStartError(false);

    try {
      await onActiveTeam();
    } catch {
      setHasStartError(true);
    } finally {
      setIsStarting(false);
    }
  };

  return {
    isCheckingActiveTeam,
    activeTeamError: hasError ? '팀 스페이스 정보를 불러오지 못했습니다.' : null,
    startTeamSpace,
  };
};
