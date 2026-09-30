'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { joinTeam } from '../api/join-team';
import { teamSpaceKeys } from './query-keys';
import type { ActiveTeamData } from './types';

export const useJoinTeamSpace = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: joinTeam,
    onSuccess: ({ teamId }) => {
      queryClient.setQueryData<ActiveTeamData>(teamSpaceKeys.activeTeam, {
        hasActiveTeam: true,
        teamId,
      });
    },
  });

  const joinTeamSpace = async (invitationCode: string, displayName: string) => {
    if (mutation.isPending) return null;

    try {
      const { teamId } = await mutation.mutateAsync({ invitationCode, displayName });

      return teamId;
    } catch {
      return null;
    }
  };

  const clearJoinError = () => {
    if (mutation.isError) {
      mutation.reset();
    }
  };

  return {
    isJoining: mutation.isPending,
    joinError: mutation.error?.message ?? null,
    joinTeamSpace,
    clearJoinError,
  };
};
