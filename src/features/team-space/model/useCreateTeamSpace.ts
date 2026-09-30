'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTeam } from '../api/create-team';
import { teamSpaceKeys } from './query-keys';
import type { ActiveTeamData } from './types';
import { useTeamSpaceOnboardingStore } from './useTeamSpaceOnboardingStore';

export const useCreateTeamSpace = () => {
  const queryClient = useQueryClient();
  const setCreateResult = useTeamSpaceOnboardingStore((state) => state.setCreateResult);

  const mutation = useMutation({
    mutationFn: createTeam,
    onSuccess: (team) => {
      setCreateResult({ teamId: team.teamId, invitationCode: team.invitationCode });
      queryClient.setQueryData<ActiveTeamData>(teamSpaceKeys.activeTeam, {
        hasActiveTeam: true,
        teamId: team.teamId,
      });
    },
  });

  const createTeamSpace = async (name: string, displayName: string) => {
    if (mutation.isPending) return false;

    try {
      await mutation.mutateAsync({ name, displayName });
      return true;
    } catch {
      return false;
    }
  };

  const clearCreateError = () => {
    if (mutation.isError) {
      mutation.reset();
    }
  };

  return {
    isCreating: mutation.isPending,
    createError: mutation.error?.message ?? null,
    createTeamSpace,
    clearCreateError,
  };
};
