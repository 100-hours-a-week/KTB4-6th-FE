'use client';

import type { RefObject } from 'react';
import { useInfiniteScrollTrigger } from '@/shared/lib';
import type { MeetingListLoadMoreStatus } from '../model/type';

interface MeetingListLoadMoreProps {
  hasMore: boolean;
  status: MeetingListLoadMoreStatus;
  onLoadMore: () => void;
  scrollRootRef: RefObject<HTMLDivElement | null>;
}

export const MeetingListLoadMore = ({
  hasMore,
  status,
  onLoadMore,
  scrollRootRef,
}: MeetingListLoadMoreProps) => {
  const triggerRef = useInfiniteScrollTrigger<HTMLDivElement>(
    onLoadMore,
    hasMore && status === 'idle',
    scrollRootRef,
  );

  if (!hasMore) {
    return <p className="mt-4 py-3 text-center text-xs text-cool-500">더 이상 회의가 없어요</p>;
  }

  return (
    <div ref={triggerRef} className="mt-4 flex min-h-11 flex-col items-center justify-center gap-2">
      {status === 'loading' && (
        <div
          role="status"
          aria-label="회의를 불러오는 중"
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
            회의를 더 불러오지 못했어요
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
