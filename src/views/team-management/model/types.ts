export type TeamMemberRole = 'leader' | 'member';

export interface TeamInfo {
  name: string;
  inviteCode: string;
  creditBalance: number;
}

export interface Participant {
  id: string;
  name: string;
  avatarInitial: string;
  isTeamLeader: boolean;
  isMe: boolean;
}
