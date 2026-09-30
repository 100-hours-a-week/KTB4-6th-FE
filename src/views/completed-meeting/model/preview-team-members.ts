export interface TeamMember {
  id: string;
  name: string;
}

// TODO: 팀 멤버 목록 조회 API(GET /api/v1/teams/{teamId}/members) 응답으로 교체한다.
export const mockTeamMembers: TeamMember[] = [
  { id: 'member-1', name: '김철수' },
  { id: 'member-2', name: '김금수' },
  { id: 'member-3', name: '김은수' },
  { id: 'member-4', name: '김양수' },
  { id: 'member-5', name: '김음수' },
];
