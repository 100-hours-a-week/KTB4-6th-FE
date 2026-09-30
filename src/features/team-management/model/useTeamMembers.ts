'use client';

import { useQuery } from '@tanstack/react-query';
import { getTeamMembers } from '../api/get-team-members';
import { teamKeys } from './query-keys';

interface UseTeamMembersOptions {
  isEnabled?: boolean;
}

export const useTeamMembers = (teamId: number, { isEnabled = true }: UseTeamMembersOptions = {}) =>
  useQuery({
    queryKey: teamKeys.members(teamId),
    queryFn: () => getTeamMembers(teamId),
    enabled: isEnabled,
  });
