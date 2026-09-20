'use client';

import { useState } from 'react';
import { joinTeam } from '../api/join-team';

export const useJoinTeamSpace = () => {
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const joinTeamSpace = async (invitationCode: string, displayName: string) => {
    if (isJoining) return null;

    setIsJoining(true);
    setJoinError(null);

    try {
      const { teamId } = await joinTeam({ invitationCode, displayName });

      return teamId;
    } catch (error) {
      setJoinError(error instanceof Error ? error.message : '팀 스페이스에 참여하지 못했습니다.');
      return null;
    } finally {
      setIsJoining(false);
    }
  };

  const clearJoinError = () => setJoinError(null);

  return { isJoining, joinError, joinTeamSpace, clearJoinError };
};
