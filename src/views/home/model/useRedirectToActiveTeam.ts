'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UseRedirectToActiveTeamOptions {
  activeTeamId: number | undefined;
  isSettled: boolean;
  urlTeamId: number;
}

export const useRedirectToActiveTeam = ({
  activeTeamId,
  isSettled,
  urlTeamId,
}: UseRedirectToActiveTeamOptions) => {
  const router = useRouter();

  useEffect(() => {
    if (activeTeamId !== undefined && isSettled && activeTeamId !== urlTeamId) {
      router.replace(`/teams/${activeTeamId}`);
    }
  }, [activeTeamId, isSettled, urlTeamId, router]);
};
