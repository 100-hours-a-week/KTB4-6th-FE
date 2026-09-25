'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getTeamHomePath, HOME_NOTICE_MEETING_DELETED, homeKeys } from '@/features/home';

/**
 * 회의가 삭제되면 홈 목록을 갱신하고 삭제 안내와 함께 팀 홈으로 이동한다.
 * 직접 삭제한 경우와 다른 참여자가 삭제한 경우가 같은 경로를 쓴다. 안내 토스트는 홈이 띄운다.
 */
export const useMeetingDeletedRedirect = (teamId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: homeKeys.all });
    router.replace(getTeamHomePath(teamId, HOME_NOTICE_MEETING_DELETED));
  }, [queryClient, router, teamId]);
};
