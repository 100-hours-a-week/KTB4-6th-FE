'use client';

import { useQuery } from '@tanstack/react-query';
import { getTeamBlocks } from '../api/get-team-blocks';
import { teamKeys } from './query-keys';
import type { BlockedMemberData } from './types';

export type TeamBlocksRequestStatus = 'loading' | 'error' | 'success';

interface UseTeamBlocksDataResult {
  status: TeamBlocksRequestStatus;
  blocks: BlockedMemberData[];
}

export const useTeamBlocksData = (teamId: number): UseTeamBlocksDataResult => {
  const { data, isPending, isError } = useQuery({
    queryKey: teamKeys.blocks(teamId),
    queryFn: () => getTeamBlocks(teamId),
  });

  const status: TeamBlocksRequestStatus = isPending ? 'loading' : isError ? 'error' : 'success';

  return { status, blocks: data ?? [] };
};
