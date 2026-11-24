'use client';

import { useQuery } from '@tanstack/react-query';
import { getHome } from '../api/get-home';
import { homeKeys, PREFETCHED_HOME_STALE_TIME } from './query-keys';

interface UseHomeOptions {
  isEnabled: boolean;
}

export const useHome = ({ isEnabled }: UseHomeOptions) =>
  useQuery({
    queryKey: homeKeys.all,
    queryFn: getHome,
    enabled: isEnabled,
    staleTime: PREFETCHED_HOME_STALE_TIME,
  });
