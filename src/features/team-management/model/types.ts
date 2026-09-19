export type ApiTeamMemberRole = 'LEADER' | 'MEMBER';

export interface TeamDetailData {
  teamId: number;
  name: string;
  teamMemberId: number;
  displayName: string;
  role: ApiTeamMemberRole;
  invitationCode: string;
  createdAt: string;
}

export interface TeamDetailResponse {
  success: boolean;
  data: TeamDetailData | null;
  error: { code: string; message: string } | null;
}

export interface TeamMemberData {
  teamMemberId: number;
  displayName: string;
  role: ApiTeamMemberRole;
}

export interface TeamMembersResponse {
  success: boolean;
  data: { members: TeamMemberData[] } | null;
  error: { code: string; message: string } | null;
}

export interface TeamCreditsData {
  balance: number;
  maxBalance: number;
}

export interface TeamCreditsResponse {
  success: boolean;
  data: TeamCreditsData | null;
  error: { code: string; message: string } | null;
}
