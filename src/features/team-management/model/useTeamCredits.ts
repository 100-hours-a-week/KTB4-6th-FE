'use client';

import { useQuery } from '@tanstack/react-query';
import { getTeamCredits } from '../api/get-team-credits';
import { teamKeys } from './query-keys';

export const useTeamCredits = (teamId: number) =>
  useQuery({
    queryKey: teamKeys.credits(teamId),
    queryFn: () => getTeamCredits(teamId),
  });
