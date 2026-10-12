'use client';

import { useState } from 'react';
import { useTeamCredits, useTeamDetail } from '@/features/team-management';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { CreditBalanceCard } from './CreditBalanceCard';
import { CreditManagementHeader } from './CreditManagementHeader';
import {
  CreditHistoryPreparingState,
  CreditManagementErrorState,
  CreditManagementLoadingState,
} from './CreditManagementStates';

interface CreditManagementPageProps {
  teamId: number;
}

export const CreditManagementPage = ({ teamId }: CreditManagementPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: team } = useTeamDetail(teamId);
  const {
    data: credits,
    isPending: isCreditsPending,
    isError: isCreditsError,
    isFetching: isCreditsFetching,
    refetch: refetchCredits,
  } = useTeamCredits(teamId);

  return (
    <div className="flex h-dvh min-h-[844px] flex-col bg-cool-50">
      <CreditManagementHeader isMenuDisabled={!team} onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {isCreditsPending ? (
          <CreditManagementLoadingState />
        ) : isCreditsError || !credits ? (
          <CreditManagementErrorState
            isRetrying={isCreditsFetching}
            onRetry={() => void refetchCredits()}
          />
        ) : (
          <>
            <div className="border-b border-cool-200 p-5">
              <CreditBalanceCard balance={credits.balance} maxBalance={credits.maxBalance} />
            </div>
            <CreditHistoryPreparingState />
          </>
        )}
      </div>

      {team && (
        <NavigationSidebar
          isOpen={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          teamId={teamId}
          teamName={team.name}
        />
      )}
    </div>
  );
};
