'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTeamCredits } from '../api/get-team-credits';
import { getTeamDetail } from '../api/get-team-detail';
import { getTeamMembers } from '../api/get-team-members';
import { teamKeys } from './query-keys';
import type { TeamCreditsData, TeamDetailData, TeamMemberData } from './types';

export type TeamManagementRequestStatus = 'loading' | 'error' | 'success';

export interface TeamManagementData {
  team: TeamDetailData;
  members: TeamMemberData[];
  credits: TeamCreditsData;
}

interface UseTeamManagementDataResult {
  status: TeamManagementRequestStatus;
  data: TeamManagementData | null;
  refetch: () => void;
  removeMember: (teamMemberId: number) => void;
}

export const useTeamManagementData = (teamId: number): UseTeamManagementDataResult => {
  const queryClient = useQueryClient();

  const teamQuery = useQuery({
    queryKey: teamKeys.detail(teamId),
    queryFn: () => getTeamDetail(teamId),
  });
  const membersQuery = useQuery({
    queryKey: teamKeys.members(teamId),
    queryFn: () => getTeamMembers(teamId),
  });
  const creditsQuery = useQuery({
    queryKey: teamKeys.credits(teamId),
    queryFn: () => getTeamCredits(teamId),
  });

  const queries = [teamQuery, membersQuery, creditsQuery];
  const status: TeamManagementRequestStatus = queries.some((query) => query.isPending)
    ? 'loading'
    : queries.some((query) => query.isError)
      ? 'error'
      : 'success';

  const data: TeamManagementData | null =
    teamQuery.data && membersQuery.data && creditsQuery.data
      ? { team: teamQuery.data, members: membersQuery.data, credits: creditsQuery.data }
      : null;

  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
    void queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) });
  };

  const removeMember = (teamMemberId: number) => {
    queryClient.setQueryData<TeamMemberData[]>(teamKeys.members(teamId), (members) =>
      members?.filter((member) => member.teamMemberId !== teamMemberId),
    );
  };

  return { status, data, refetch, removeMember };
};
