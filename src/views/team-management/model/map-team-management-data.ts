import type { BlockedMemberData, TeamManagementData } from '@/features/team-management';
import type { BlockedMember, Participant, TeamInfo, TeamMemberRole } from './types';

// TODO: 회의 도메인 API가 나오면 실제 값으로 교체. 현재 팀 API 스펙에는 없어 하드코딩.
const HAS_ACTIVE_MEETING_PLACEHOLDER = false;

export interface MappedTeamManagementData {
  role: TeamMemberRole;
  team: TeamInfo;
  participants: Participant[];
}

export const mapTeamManagementData = ({
  team,
  members,
  credits,
}: TeamManagementData): MappedTeamManagementData => {
  const teamInfo: TeamInfo = {
    name: team.name,
    inviteCode: team.invitationCode,
    creditBalance: credits.balance,
    hasActiveMeeting: HAS_ACTIVE_MEETING_PLACEHOLDER,
  };

  const participants: Participant[] = members.map((member) => ({
    id: String(member.teamMemberId),
    name: member.displayName,
    avatarInitial: member.displayName.charAt(0),
    isTeamLeader: member.role === 'LEADER',
    isMe: member.teamMemberId === team.teamMemberId,
  }));

  return {
    role: team.role === 'LEADER' ? 'leader' : 'member',
    team: teamInfo,
    participants,
  };
};

export const mapBlockedMembers = (blocks: BlockedMemberData[]): BlockedMember[] =>
  blocks.map((block) => ({
    id: String(block.blockId),
    name: block.displayName,
    avatarInitial: block.displayName.charAt(0),
  }));
