'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { releaseTeamBlock } from '../api/release-team-block';
import { teamKeys } from './query-keys';
import type { BlockedMemberData } from './types';

export const useReleaseTeamBlock = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockId: number) => releaseTeamBlock(teamId, blockId),
    onSuccess: (_, blockId) => {
      queryClient.setQueryData<BlockedMemberData[]>(teamKeys.blocks(teamId), (blocks) =>
        blocks?.filter((block) => block.blockId !== blockId),
      );
    },
  });
};
