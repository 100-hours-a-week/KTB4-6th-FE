export interface ActiveTeamData {
  hasActiveTeam: boolean;
  teamId: number | null;
}

export interface ActiveTeamResponse {
  success: boolean;
  data: ActiveTeamData | null;
  error: unknown | null;
}
