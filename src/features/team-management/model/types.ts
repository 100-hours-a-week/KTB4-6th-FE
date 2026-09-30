export type ApiTeamMemberRole = 'LEADER' | 'MEMBER';

export interface ApiErrorPayload {
  code: string;
  message: string;
}

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
  error: ApiErrorPayload | null;
}

export interface TeamMemberData {
  teamMemberId: number;
  displayName: string;
  role: ApiTeamMemberRole;
}

export interface TeamMembersResponse {
  success: boolean;
  data: { members: TeamMemberData[] } | null;
  error: ApiErrorPayload | null;
}

export interface TeamCreditsData {
  balance: number;
  maxBalance: number;
}

export interface TeamCreditsResponse {
  success: boolean;
  data: TeamCreditsData | null;
  error: ApiErrorPayload | null;
}

export interface UpdateTeamNameData {
  teamId: number;
  name: string;
  updatedAt: string;
}

export interface UpdateTeamNameResponse {
  success: boolean;
  data: UpdateTeamNameData | null;
  error: ApiErrorPayload | null;
}

export interface InvitationCodeData {
  invitationCodeId: number;
  code: string;
  createdAt: string;
}

export interface RegenerateInvitationCodeResponse {
  success: boolean;
  data: InvitationCodeData | null;
  error: ApiErrorPayload | null;
}

export interface BlockedMemberData {
  blockId: number;
  userId: number;
  displayName: string;
  createdAt: string;
}

export interface TeamBlocksResponse {
  success: boolean;
  data: { blocks: BlockedMemberData[] } | null;
  error: ApiErrorPayload | null;
}
