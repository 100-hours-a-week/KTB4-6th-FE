export type TeamMemberRole = 'leader' | 'member';

export type TeamPageStatus = 'loading' | 'error' | 'success';

export interface TeamInfo {
  name: string;
  inviteCode: string;
  creditBalance: number;
  hasActiveMeeting: boolean;
}

export interface Participant {
  id: string;
  name: string;
  avatarInitial: string;
  isTeamLeader: boolean;
  isMe: boolean;
}

export interface BlockedMember {
  id: string;
  name: string;
  avatarInitial: string;
}
