export interface ActiveTeamData {
  hasActiveTeam: boolean;
  teamId: number | null;
}

export interface ActiveTeamResponse {
  success: boolean;
  data: ActiveTeamData | null;
  error: unknown | null;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
}

export interface CreateTeamRequest {
  name: string;
  displayName: string;
}

export interface CreateTeamData {
  teamId: number;
  name: string;
  teamMemberId: number;
  displayName: string;
  role: 'LEADER' | 'MEMBER';
  membershipStatus: string;
  invitationCode: string;
  createdAt: string;
}

export interface CreateTeamResponse {
  success: boolean;
  data: CreateTeamData | null;
  error: ApiErrorPayload | null;
}

export interface JoinTeamRequest {
  invitationCode: string;
  displayName: string;
}

export interface JoinTeamData {
  hasActiveTeam: boolean;
  teamId: number;
}

export interface JoinTeamResponse {
  success: boolean;
  data: JoinTeamData | null;
  error: ApiErrorPayload | null;
}
