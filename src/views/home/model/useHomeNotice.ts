'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTeamHomePath, HOME_NOTICE_MEETING_DELETED } from '@/features/home';
import { useAppToast, type AppToastVariant } from '@/shared/ui';

const HOME_NOTICES: Record<string, { message: string; variant: AppToastVariant }> = {
  [HOME_NOTICE_MEETING_DELETED]: { message: '회의가 삭제되었습니다.', variant: 'success' },
};

interface UseHomeNoticeParams {
  teamId: number;
}

export const useHomeNotice = ({ teamId }: UseHomeNoticeParams) => {
  const notice = useSearchParams().get('notice');
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
