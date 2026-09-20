'use client';

import { useMutation } from '@tanstack/react-query';
import { joinTeam } from '../api/join-team';

export const useJoinTeamSpace = () => {
  const mutation = useMutation({ mutationFn: joinTeam });

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
