'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveTeam } from '../api/leave-team';
import { teamKeys } from './query-keys';

export const useLeaveTeam = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => leaveTeam(teamId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: teamKeys.all(teamId) });
    },
  });
};
