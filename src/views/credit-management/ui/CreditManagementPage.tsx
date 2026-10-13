'use client';

import { useState } from 'react';
import { useCreditLedgers } from '@/features/credit-management';
import { useTeamCredits, useTeamDetail } from '@/features/team-management';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { toCreditLedgerViewModels } from '../model/credit-ledger-view';
import { CreditBalanceCard } from './CreditBalanceCard';
import { CreditLedgerList } from './CreditLedgerList';
import { CreditManagementHeader } from './CreditManagementHeader';
import { CreditManagementErrorState, CreditManagementLoadingState } from './CreditManagementStates';

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
  const { data: creditLedgerPages } = useCreditLedgers(teamId);
  const creditLedgers = toCreditLedgerViewModels(creditLedgerPages?.pages ?? []);

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
            <CreditLedgerList ledgers={creditLedgers} />
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
