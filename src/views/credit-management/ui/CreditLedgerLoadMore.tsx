'use client';

import type { RefObject } from 'react';
import { useInfiniteScrollTrigger } from '@/shared/lib';

export type CreditLedgerLoadMoreStatus = 'idle' | 'loading' | 'error';

interface CreditLedgerLoadMoreProps {
  hasMore: boolean;
  status: CreditLedgerLoadMoreStatus;
  onLoadMore: () => void;
  scrollRootRef: RefObject<HTMLDivElement | null>;
}

export const CreditLedgerLoadMore = ({
  hasMore,
  status,
  onLoadMore,
  scrollRootRef,
}: CreditLedgerLoadMoreProps) => {
  const triggerRef = useInfiniteScrollTrigger<HTMLDivElement>(
    onLoadMore,
    hasMore && status === 'idle',
    scrollRootRef,
  );

  if (!hasMore) return null;

  return (
    <div ref={triggerRef} className="flex min-h-16 flex-col items-center justify-center gap-2 py-4">
      {status === 'loading' && (
        <div
          role="status"
          aria-label="크레딧 내역을 더 불러오는 중"
          className="flex items-center gap-2 text-sm text-cool-500"
        >
          <span
            aria-hidden="true"
            className="size-4 shrink-0 rounded-full border-2 border-cool-200 border-t-brand-600 motion-safe:animate-spin"
          />
          불러오는 중
        </div>
      )}

      {status === 'error' && (
        <>
          <p role="alert" className="text-xs text-danger">
            크레딧 내역을 더 불러오지 못했어요
          </p>
          <button
            type="button"
            onClick={onLoadMore}
            className="h-10 rounded-xl border border-cool-200 px-4 text-sm font-medium text-cool-600 transition-colors hover:bg-cool-50"
          >
            다시 시도
          </button>
        </>
      )}
    </div>
  );
};
