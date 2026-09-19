'use client';

import { useEffect, useState } from 'react';
import { getTeamBlocks } from '../api/get-team-blocks';
import type { BlockedMemberData } from './types';

export type TeamBlocksRequestStatus = 'loading' | 'error' | 'success';

interface UseTeamBlocksDataResult {
  status: TeamBlocksRequestStatus;
  blocks: BlockedMemberData[];
  removeBlock: (blockId: number) => void;
}

export const useTeamBlocksData = (teamId: number): UseTeamBlocksDataResult => {
  const [status, setStatus] = useState<TeamBlocksRequestStatus>('loading');
  const [blocks, setBlocks] = useState<BlockedMemberData[]>([]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const result = await getTeamBlocks(teamId);
        if (ignore) return;
        setBlocks(result);
        setStatus('success');
      } catch {
        if (!ignore) setStatus('error');
      }
    };

    void load();

    return () => {
      ignore = true;
    };
  }, [teamId]);

  const removeBlock = (blockId: number) => {
    setBlocks((prev) => prev.filter((block) => block.blockId !== blockId));
  };

  return { status, blocks, removeBlock };
};
