import type { BlockedMember, Participant, TeamInfo } from './types';

// UI 목업용 더미 데이터. 실제 팀 정보 연동은 서브 이슈 5(데이터 연결)에서 진행한다.
export const mockTeamInfo: TeamInfo = {
  name: '프로덕트디자인팀',
  inviteCode: 'K7M2Q9PX',
  creditBalance: 300,
  hasActiveMeeting: false,
};

// 팀장이 최상단, 나머지는 최근 참여순으로 이미 정렬된 상태를 가정한다.
export const mockParticipants: Participant[] = [
  { id: 'p1', name: '김도현', avatarInitial: '김', isTeamLeader: true, isMe: true },
  { id: 'p2', name: '박서연', avatarInitial: '박', isTeamLeader: false, isMe: false },
  { id: 'p3', name: '이준호', avatarInitial: '이', isTeamLeader: false, isMe: false },
  { id: 'p4', name: '최민지', avatarInitial: '최', isTeamLeader: false, isMe: false },
  { id: 'p5', name: '정우성', avatarInitial: '정', isTeamLeader: false, isMe: false },
  { id: 'p6', name: '한지민', avatarInitial: '한', isTeamLeader: false, isMe: false },
  { id: 'p7', name: '오세훈', avatarInitial: '오', isTeamLeader: false, isMe: false },
  { id: 'p8', name: '윤아름', avatarInitial: '윤', isTeamLeader: false, isMe: false },
  { id: 'p9', name: '장동건', avatarInitial: '장', isTeamLeader: false, isMe: false },
  { id: 'p10', name: '서지수', avatarInitial: '서', isTeamLeader: false, isMe: false },
];

export const mockBlockedMembers: BlockedMember[] = [
  { id: 'b1', name: '강태오', avatarInitial: '강' },
  { id: 'b2', name: '임수정', avatarInitial: '임' },
  { id: 'b3', name: '조인성', avatarInitial: '조' },
];
