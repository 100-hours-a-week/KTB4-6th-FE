'use client';

import { useQuery } from '@tanstack/react-query';
import { getTeamDetail } from '../api/get-team-detail';
import { teamKeys } from './query-keys';

interface UseTeamDetailOptions {
  isEnabled?: boolean;
}

export const useTeamDetail = (teamId: number, { isEnabled = true }: UseTeamDetailOptions = {}) =>
  useQuery({
    queryKey: teamKeys.detail(teamId),
    queryFn: () => getTeamDetail(teamId),
    enabled: isEnabled,
  });
