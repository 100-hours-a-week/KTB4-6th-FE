'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { regenerateInvitationCode } from '../api/regenerate-invitation-code';
import { teamKeys } from './query-keys';
import type { TeamDetailData } from './types';

export const useRegenerateInvitationCode = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => regenerateInvitationCode(teamId),
    onSuccess: ({ code }) => {
      queryClient.setQueryData<TeamDetailData>(teamKeys.detail(teamId), (team) =>
        team ? { ...team, invitationCode: code } : team,
      );
    },
  });
};
