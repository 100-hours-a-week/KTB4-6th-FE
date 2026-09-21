'use client';

import { useHome } from './useHome';

// TODO: 백엔드에서 진행 중인 회의 조회 API를 제공할 예정이라 임시 구현이다.
// 지금은 홈 응답의 오늘 회의만 보므로 어제 시작해 이어지는 회의는 놓친다.
// API가 나오면 이 훅의 조회 방식만 교체한다.
export const useActiveMeeting = (teamId: number) => {
  const { data: home, isPending } = useHome({ isEnabled: true });

  const activeMeeting =
    home?.team.teamId === teamId
      ? (home.todayMeetings.find((meeting) => meeting.status === 'IN_PROGRESS') ?? null)
      : null;

  return { activeMeeting, isPending };
};
