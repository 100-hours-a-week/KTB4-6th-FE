import type { RefObject } from 'react';
import type { CreditLedgerViewModel } from '../model/credit-ledger-view';
import { CreditLedgerList } from './CreditLedgerList';
import {
  CreditLedgerEmptyState,
  CreditLedgerErrorState,
  CreditLedgerLoadingState,
} from './CreditManagementStates';
import { CreditLedgerLoadMore, type CreditLedgerLoadMoreStatus } from './CreditLedgerLoadMore';

interface CreditLedgerSectionProps {
  ledgers: CreditLedgerViewModel[];
  isPending: boolean;
  isError: boolean;
  isRetrying: boolean;
  hasMore: boolean;
  loadMoreStatus: CreditLedgerLoadMoreStatus;
  onRetry: () => void;
  onLoadMore: () => void;
  scrollRootRef: RefObject<HTMLDivElement | null>;
}

export const CreditLedgerSection = ({
  ledgers,
  isPending,
  isError,
  isRetrying,
  hasMore,
  loadMoreStatus,
  onRetry,
  onLoadMore,
  scrollRootRef,
}: CreditLedgerSectionProps) => (
  <section aria-labelledby="credit-ledger-list-title" className="bg-white">
    <h2
      id="credit-ledger-list-title"
      className="border-b border-cool-200 px-5 py-4 text-base font-bold text-cool-900"
    >
      전체 내역
    </h2>

    {isPending ? (
      <CreditLedgerLoadingState />
    ) : isError ? (
      <CreditLedgerErrorState isRetrying={isRetrying} onRetry={onRetry} />
    ) : ledgers.length === 0 ? (
      <CreditLedgerEmptyState />
    ) : (
      <>
        <CreditLedgerList ledgers={ledgers} />
        <CreditLedgerLoadMore
          hasMore={hasMore}
          status={loadMoreStatus}
          onLoadMore={onLoadMore}
          scrollRootRef={scrollRootRef}
        />
      </>
    )}
  </section>
);
