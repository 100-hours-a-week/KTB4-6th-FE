'use client';

import { useRouter } from 'next/navigation';
import { useTeamSpaceOnboardingStore } from '@/features/team-space';
import { useCreatedTeam } from '../model/useCreatedTeam';
import { InviteCodeCompleteScreen } from './InviteCodeCompleteScreen';

export const TeamCreatedScreen = () => {
  const router = useRouter();
  const createdTeam = useCreatedTeam();
  const resetCreate = useTeamSpaceOnboardingStore((state) => state.resetCreate);

  if (!createdTeam) {
    return null;
  }

  const handleMoveToTeamSpace = () => {
    resetCreate();
    router.push(`/teams/${createdTeam.teamId}`);
  };

  return (
    <InviteCodeCompleteScreen
      inviteCode={createdTeam.invitationCode}
      onMoveToTeamSpace={handleMoveToTeamSpace}
    />
  );
};
