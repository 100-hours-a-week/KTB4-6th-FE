'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamSpaceOnboardingStore } from '@/features/team-space';

export const useCreatedTeam = () => {
  const router = useRouter();
  const [createdTeam] = useState(() => useTeamSpaceOnboardingStore.getState().create.result);

  useEffect(() => {
    if (!createdTeam) {
      router.replace('/teams/create');
    }
  }, [createdTeam, router]);

  return createdTeam;
};
