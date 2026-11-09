import { getActiveTeamOnServer } from '@/features/team-space/index.server';

export const findActiveTeam = async (accessToken: string) => {
  try {
    return await getActiveTeamOnServer(accessToken);
  } catch {
    return null;
  }
};
