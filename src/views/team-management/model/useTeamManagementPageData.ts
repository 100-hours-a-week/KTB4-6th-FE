'use client';

import { useTeamManagementData } from '@/features/team-management';
import { mapTeamManagementData } from './map-team-management-data';
import type { Participant, TeamInfo, TeamMemberRole, TeamPageStatus } from './types';

interface UseTeamManagementPageDataResult {
  status: TeamPageStatus;
  role: TeamMemberRole | null;
  team: TeamInfo | null;
  participants: Participant[];
  refetch: () => void;
}

export const useTeamManagementPageData = (teamId: number): UseTeamManagementPageDataResult => {
  const { status, data, refetch } = useTeamManagementData(teamId);

  if (status !== 'success' || !data) {
    return { status, role: null, team: null, participants: [], refetch };
  }

  const { role, team, participants } = mapTeamManagementData(data);

  return { status: 'success', role, team, participants, refetch };
};
