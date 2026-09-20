'use client';

import { useQuery } from '@tanstack/react-query';
import { getActiveTeam } from '../api/get-active-team';
import { teamSpaceKeys } from './query-keys';

interface UseStartTeamSpaceOptions {
  isEnabled: boolean;
  onNoActiveTeam: () => void;
}

export const useStartTeamSpace = ({ isEnabled, onNoActiveTeam }: UseStartTeamSpaceOptions) => {
  const activeTeamQuery = useQuery({
    queryKey: teamSpaceKeys.activeTeam,
    queryFn: getActiveTeam,
    enabled: isEnabled,
  });

  const hasActiveTeam = activeTeamQuery.data?.hasActiveTeam === true;
  const isCheckingActiveTeam = activeTeamQuery.isFetching && !activeTeamQuery.data;
  const hasActiveTeamError = activeTeamQuery.isError && !activeTeamQuery.isFetching;

  /** 소속 팀이 있으면 true를 반환하고, 없으면 onNoActiveTeam을 호출한 뒤 false를 반환한다. */
  const startTeamSpace = async () => {
    if (isCheckingActiveTeam) return false;

    const activeTeam = activeTeamQuery.data ?? (await activeTeamQuery.refetch()).data;

    if (!activeTeam) return false;

    if (!activeTeam.hasActiveTeam) {
      onNoActiveTeam();
      return false;
    }

    return true;
  };

  return { isCheckingActiveTeam, hasActiveTeam, hasActiveTeamError, startTeamSpace };
};
