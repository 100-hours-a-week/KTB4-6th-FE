'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { teamKeys, type TeamCreditsData, useTeamCredits } from '@/features/team-management';

export const useMeetingChatCredits = (teamId: number) => {
  const queryClient = useQueryClient();
  const creditsQuery = useTeamCredits(teamId);

  const updateCreditBalance = useCallback(
    (creditBalance: number) => {
      queryClient.setQueryData<TeamCreditsData>(teamKeys.credits(teamId), (currentCredits) =>
        currentCredits ? { ...currentCredits, balance: creditBalance } : currentCredits,
      );
    },
    [queryClient, teamId],
  );

  return {
    creditBalance: creditsQuery.data?.balance ?? null,
    isLoading: creditsQuery.isPending,
    isError: creditsQuery.isError && !creditsQuery.data,
    refreshCreditBalance: creditsQuery.refetch,
    updateCreditBalance,
  };
};
