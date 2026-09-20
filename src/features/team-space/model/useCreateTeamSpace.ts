'use client';

import { useState } from 'react';
import { createTeam } from '../api/create-team';
import { useTeamSpaceOnboardingStore } from './useTeamSpaceOnboardingStore';

export const useCreateTeamSpace = () => {
  const setCreateResult = useTeamSpaceOnboardingStore((state) => state.setCreateResult);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const createTeamSpace = async (name: string, displayName: string) => {
    if (isCreating) return false;

    setIsCreating(true);
    setCreateError(null);

    try {
      const team = await createTeam({ name, displayName });

      setCreateResult({ teamId: team.teamId, invitationCode: team.invitationCode });
      return true;
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : '팀 스페이스를 생성하지 못했습니다.');
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const clearCreateError = () => setCreateError(null);

  return { isCreating, createError, createTeamSpace, clearCreateError };
};
