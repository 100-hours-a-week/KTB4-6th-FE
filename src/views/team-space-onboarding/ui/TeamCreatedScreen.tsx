'use client';

import { useCreatedTeam } from '../model/useCreatedTeam';
import { InviteCodeCompleteScreen } from './InviteCodeCompleteScreen';

export const TeamCreatedScreen = () => {
  const createdTeam = useCreatedTeam();

  if (!createdTeam) {
    return null;
  }

  return <InviteCodeCompleteScreen inviteCode={createdTeam.invitationCode} />;
};
