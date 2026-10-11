'use client';

import { useTeamCredits } from '@/features/team-management';

export const useMeetingChatCredits = (teamId: number) => {
  const creditsQuery = useTeamCredits(teamId);

  return {
    creditBalance: creditsQuery.data?.balance ?? null,
    isLoading: creditsQuery.isPending,
    isError: creditsQuery.isError && !creditsQuery.data,
    refreshCreditBalance: creditsQuery.refetch,
  };
};
