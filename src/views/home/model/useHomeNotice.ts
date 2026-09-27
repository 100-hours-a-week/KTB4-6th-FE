'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getTeamHomePath, HOME_NOTICE_MEETING_DELETED } from '@/features/home';
import { useAppToast, type AppToastVariant } from '@/shared/ui';

const HOME_NOTICES: Record<string, { message: string; variant: AppToastVariant }> = {
  [HOME_NOTICE_MEETING_DELETED]: { message: '회의가 삭제되었습니다.', variant: 'success' },
};

interface UseHomeNoticeParams {
  teamId: number;
  notice?: string;
}

/**
 * 다른 화면에서 notice를 달고 홈으로 이동해 오면 홈에서 토스트를 한 번 띄우고, 주소에서 notice를 지운다.
 * 이동 경로가 여러 개여도 안내는 홈이 한 곳에서만 띄워 중복되지 않는다.
 */
export const useHomeNotice = ({ teamId, notice }: UseHomeNoticeParams) => {
  const router = useRouter();
  const { showToast } = useAppToast();
  const hasShownRef = useRef(false);

  useEffect(() => {
    const homeNotice = notice ? HOME_NOTICES[notice] : undefined;
    if (!homeNotice || hasShownRef.current) return;

    hasShownRef.current = true;
    showToast(homeNotice.message, homeNotice.variant);
    router.replace(getTeamHomePath(teamId));
  }, [notice, router, showToast, teamId]);
};
