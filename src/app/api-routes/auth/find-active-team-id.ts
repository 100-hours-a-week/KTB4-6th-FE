import { getActiveTeamOnServer } from '@/features/team-space/index.server';

export const findActiveTeamId = async (accessToken: string) => {
  try {
    const activeTeam = await getActiveTeamOnServer(accessToken);
    return activeTeam.hasActiveTeam ? activeTeam.teamId : null;
  } catch {
    return null;
  }
};
