'use client';

import { useMemo } from 'react';
import { useTeamMembers } from '@/features/team-management';

export const useAssistantChatMemberNames = (teamId: number, isEnabled: boolean) => {
  const { data: members } = useTeamMembers(teamId, { isEnabled });

  return useMemo(
    () => new Map((members ?? []).map((member) => [member.teamMemberId, member.displayName])),
    [members],
  );
};
