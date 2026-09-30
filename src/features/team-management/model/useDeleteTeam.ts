'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTeam } from '../api/delete-team';
import { teamKeys } from './query-keys';

export const useDeleteTeam = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteTeam(teamId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: teamKeys.all(teamId) });
    },
  });
};
