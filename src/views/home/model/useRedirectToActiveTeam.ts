'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UseRedirectToActiveTeamOptions {
  activeTeamId: number | undefined;
  dataUpdatedAt: number;
  isError: boolean;
  isFetching: boolean;
  refetch: () => unknown;
  urlTeamId: number;
}

/**
 * 홈 응답의 팀 ID가 주소의 팀 ID와 다르면 응답 기준 주소로 이동한다.
 * 캐시가 이 화면 진입 이후에 받은 값이 아니면 이동하지 않고 먼저 재조회해 확인한다.
 */
export const useRedirectToActiveTeam = ({
  activeTeamId,
  dataUpdatedAt,
  isError,
  isFetching,
  refetch,
  urlTeamId,
}: UseRedirectToActiveTeamOptions) => {
  const router = useRouter();
  const [enteredAt] = useState(() => Date.now());

  useEffect(() => {
    if (activeTeamId === undefined || activeTeamId === urlTeamId || isFetching || isError) {
      return;
    }

    if (dataUpdatedAt >= enteredAt) {
      router.replace(`/teams/${activeTeamId}`);
      return;
    }

    void refetch();
  }, [activeTeamId, dataUpdatedAt, enteredAt, isError, isFetching, refetch, urlTeamId, router]);
};
