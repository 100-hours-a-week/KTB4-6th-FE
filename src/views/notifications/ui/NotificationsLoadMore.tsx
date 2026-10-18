'use client';

import type { RefObject } from 'react';
import { useInfiniteScrollTrigger } from '@/shared/lib';
import type { NotificationsLoadMoreStatus } from '../model/types';

interface NotificationsLoadMoreProps {
  hasMore: boolean;
  status: NotificationsLoadMoreStatus;
  onLoadMore: () => void;
  scrollRootRef: RefObject<HTMLDivElement | null>;
}

export const NotificationsLoadMore = ({
  hasMore,
  status,
  onLoadMore,
  scrollRootRef,
}: NotificationsLoadMoreProps) => {
  const triggerRef = useInfiniteScrollTrigger<HTMLDivElement>(
    onLoadMore,
    hasMore && status === 'idle',
    scrollRootRef,
  );

  if (!hasMore) {
    return (
      <p className="py-6 text-center text-[13px] text-cool-500">
        알림은 30일이 지나면 자동으로 삭제됩니다
      </p>
    );
  }

  return (
    <div ref={triggerRef} className="flex min-h-16 flex-col items-center justify-center gap-2 py-4">
      {status === 'loading' && (
        <div
          role="status"
          aria-label="알림을 불러오는 중"
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
            알림을 더 불러오지 못했어요
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
