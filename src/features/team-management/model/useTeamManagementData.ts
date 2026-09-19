'use client';

import { useEffect, useState } from 'react';
import { getTeamCredits } from '../api/get-team-credits';
import { getTeamDetail } from '../api/get-team-detail';
import { getTeamMembers } from '../api/get-team-members';
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
  const [status, setStatus] = useState<TeamManagementRequestStatus>('loading');
  const [data, setData] = useState<TeamManagementData | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const [team, members, credits] = await Promise.all([
          getTeamDetail(teamId),
          getTeamMembers(teamId),
          getTeamCredits(teamId),
        ]);

        if (ignore) return;
        setData({ team, members, credits });
        setStatus('success');
      } catch {
        if (!ignore) setStatus('error');
      }
    };

    void load();

    return () => {
      ignore = true;
    };
  }, [teamId, reloadCount]);

  const refetch = () => {
    setStatus('loading');
    setReloadCount((count) => count + 1);
  };

  const removeMember = (teamMemberId: number) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            members: prev.members.filter((member) => member.teamMemberId !== teamMemberId),
          }
        : prev,
    );
  };

  return { status, data, refetch, removeMember };
};
