'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getCreditLedgers } from '../api/get-credit-ledgers';
import { creditLedgerKeys } from './query-keys';

export const useCreditLedgers = (teamId: number) =>
  useInfiniteQuery({
    queryKey: creditLedgerKeys.list(teamId),
    queryFn: ({ pageParam, signal }) => getCreditLedgers(teamId, { cursor: pageParam }, signal),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.nextCursor !== null ? lastPage.nextCursor : undefined,
    enabled: Number.isSafeInteger(teamId) && teamId > 0,
  });
