import type { BlockedMember } from './types';

// 차단 목록은 아직 API 연동 전이라 목업을 유지한다. 서브 이슈 5의 참여자·팀 단위 액션 연동(PR 5-3)에서 실제 API로 대체한다.
export const mockBlockedMembers: BlockedMember[] = [
  { id: 'b1', name: '강태오', avatarInitial: '강' },
  { id: 'b2', name: '임수정', avatarInitial: '임' },
  { id: 'b3', name: '조인성', avatarInitial: '조' },
];
