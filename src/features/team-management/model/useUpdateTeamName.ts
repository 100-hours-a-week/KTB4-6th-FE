'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTeamName } from '../api/update-team-name';
import { teamKeys } from './query-keys';
import type { TeamDetailData } from './types';

export const useUpdateTeamName = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => updateTeamName(teamId, name),
    onSuccess: ({ name }) => {
      queryClient.setQueryData<TeamDetailData>(teamKeys.detail(teamId), (team) =>
        team ? { ...team, name } : team,
      );
    },
  });
};
