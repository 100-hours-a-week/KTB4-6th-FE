'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { delegateTeamLeader } from '../api/delegate-team-leader';
import { teamKeys } from './query-keys';

export const useDelegateTeamLeader = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamMemberId: number) => delegateTeamLeader(teamId, teamMemberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
      void queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) });
    },
  });
};
