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
  compactBalance?: number;
  isCompactBalanceVisible: boolean;
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
  compactBalance,
  isCompactBalanceVisible,
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
  <section aria-labelledby="credit-ledger-list-title" className="min-h-full bg-cool-50">
    <div className="sticky top-0 z-10 bg-cool-50 px-[22px] pt-[18px] pb-2.5">
      <div className="flex items-center justify-between gap-3">
        <h2
          id="credit-ledger-list-title"
          className="px-0.5 text-base font-semibold tracking-[-0.02em] text-cool-900"
        >
          전체 내역
        </h2>

        {compactBalance !== undefined && (
          <span
            aria-hidden="true"
            className={`rounded-full bg-brand-100 px-3 py-1.5 text-sm font-semibold text-brand-600 transition-[opacity,transform] duration-200 ${
              isCompactBalanceVisible
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-1 opacity-0'
            }`}
          >
            {compactBalance.toLocaleString('ko-KR')} 크레딧
          </span>
        )}
      </div>
    </div>

    <div className="px-[22px] pb-8">
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
    </div>
  </section>
);
