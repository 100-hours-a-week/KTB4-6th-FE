'use client';

import { useQuery } from '@tanstack/react-query';
import { getHome } from '../api/get-home';
import { homeKeys } from './query-keys';

interface UseHomeOptions {
  isEnabled: boolean;
}

export const useHome = ({ isEnabled }: UseHomeOptions) =>
  useQuery({
    queryKey: homeKeys.all,
    queryFn: getHome,
    enabled: isEnabled,
  });
