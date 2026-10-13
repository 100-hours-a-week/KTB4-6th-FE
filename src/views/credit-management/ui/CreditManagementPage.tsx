'use client';

import { useEffect, useRef, useState } from 'react';
import { useCreditLedgers } from '@/features/credit-management';
import { useTeamCredits, useTeamDetail } from '@/features/team-management';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { toCreditLedgerViewModels } from '../model/credit-ledger-view';
import { CreditBalanceCard } from './CreditBalanceCard';
import { CreditLedgerSection } from './CreditLedgerSection';
import { CreditManagementHeader } from './CreditManagementHeader';
import { CreditBalanceErrorState, CreditBalanceLoadingState } from './CreditManagementStates';

interface CreditManagementPageProps {
  teamId: number;
}

export const CreditManagementPage = ({ teamId }: CreditManagementPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCompactBalanceVisible, setIsCompactBalanceVisible] = useState(false);
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const creditBalanceSectionRef = useRef<HTMLDivElement>(null);
  const { data: team } = useTeamDetail(teamId);
  const {
    data: credits,
    isPending: isCreditsPending,
    isFetching: isCreditsFetching,
    refetch: refetchCredits,
  } = useTeamCredits(teamId);
  const {
    data: creditLedgerPages,
    isPending: isCreditLedgersPending,
    isError: isCreditLedgersError,
    isFetching: isCreditLedgersFetching,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch: refetchCreditLedgers,
    fetchNextPage,
  } = useCreditLedgers(teamId);
  const creditLedgers = toCreditLedgerViewModels(creditLedgerPages?.pages ?? []);
  const loadMoreStatus = isFetchingNextPage ? 'loading' : isFetchNextPageError ? 'error' : 'idle';

  useEffect(() => {
    const scrollRoot = scrollRootRef.current;
    const creditBalanceSection = creditBalanceSectionRef.current;
    if (!scrollRoot || !creditBalanceSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsCompactBalanceVisible(!entry.isIntersecting),
      { root: scrollRoot, threshold: 0 },
    );

    observer.observe(creditBalanceSection);

    return () => observer.disconnect();
  }, []);

  const handleLoadMore = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  };

  return (
    <div className="flex h-dvh min-h-[844px] flex-col bg-cool-50">
      <CreditManagementHeader isMenuDisabled={!team} onMenuClick={() => setIsSidebarOpen(true)} />

      <div ref={scrollRootRef} className="min-h-0 flex-1 overflow-y-auto">
        <div
          ref={creditBalanceSectionRef}
          className="border-b border-cool-200 bg-cool-50 px-[22px] pt-4 pb-3.5"
        >
          {credits ? (
            <CreditBalanceCard balance={credits.balance} maxBalance={credits.maxBalance} />
          ) : isCreditsPending ? (
            <CreditBalanceLoadingState />
          ) : (
            <CreditBalanceErrorState
              isRetrying={isCreditsFetching}
              onRetry={() => void refetchCredits()}
            />
          )}
        </div>

        <CreditLedgerSection
          compactBalance={credits?.balance}
          isCompactBalanceVisible={isCompactBalanceVisible}
          ledgers={creditLedgers}
          isPending={isCreditLedgersPending}
          isError={isCreditLedgersError && !creditLedgerPages}
          isRetrying={isCreditLedgersFetching && !creditLedgerPages}
          hasMore={hasNextPage}
          loadMoreStatus={loadMoreStatus}
          onRetry={() => void refetchCreditLedgers()}
          onLoadMore={handleLoadMore}
          scrollRootRef={scrollRootRef}
        />
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
