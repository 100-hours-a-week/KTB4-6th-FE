'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kickTeamMember } from '../api/kick-team-member';
import { teamKeys } from './query-keys';
import type { TeamMemberData } from './types';

export const useKickTeamMember = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamMemberId: number) => kickTeamMember(teamId, teamMemberId),
    onSuccess: (_, teamMemberId) => {
      queryClient.setQueryData<TeamMemberData[]>(teamKeys.members(teamId), (members) =>
        members?.filter((member) => member.teamMemberId !== teamMemberId),
      );
      void queryClient.invalidateQueries({ queryKey: teamKeys.blocks(teamId) });
    },
  });
};
