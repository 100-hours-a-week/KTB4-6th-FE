'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTeamBlocks } from '../api/get-team-blocks';
import { teamKeys } from './query-keys';
import type { BlockedMemberData } from './types';

export type TeamBlocksRequestStatus = 'loading' | 'error' | 'success';

interface UseTeamBlocksDataResult {
  status: TeamBlocksRequestStatus;
  blocks: BlockedMemberData[];
  removeBlock: (blockId: number) => void;
}

export const useTeamBlocksData = (teamId: number): UseTeamBlocksDataResult => {
  const queryClient = useQueryClient();

  const { data, isPending, isError } = useQuery({
    queryKey: teamKeys.blocks(teamId),
    queryFn: () => getTeamBlocks(teamId),
  });

  const status: TeamBlocksRequestStatus = isPending ? 'loading' : isError ? 'error' : 'success';

  const removeBlock = (blockId: number) => {
    queryClient.setQueryData<BlockedMemberData[]>(teamKeys.blocks(teamId), (blocks) =>
      blocks?.filter((block) => block.blockId !== blockId),
    );
  };

  return { status, blocks: data ?? [], removeBlock };
};
