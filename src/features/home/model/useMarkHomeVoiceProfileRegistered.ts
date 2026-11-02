'use client';

import { useQueryClient } from '@tanstack/react-query';
import { homeKeys } from './query-keys';
import type { HomeData } from './types';

export const useMarkHomeVoiceProfileRegistered = () => {
  const queryClient = useQueryClient();

  return () =>
    queryClient.setQueryData<HomeData>(
      homeKeys.all,
      (home) => home && { ...home, hasVoiceProfile: true },
    );
};
