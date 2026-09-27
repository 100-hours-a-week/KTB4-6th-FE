'use client';

import { useMeetingDeletedRedirect } from '@/features/home';
import { useMeetingExit } from '@/features/meeting-sse';
import { useAppToast } from '@/shared/ui';

interface UseMeetingDeleteParams {
  teamId: string;
  meetingId: number;
}

/** 종료된 회의를 삭제하고, 성공하면 삭제 안내와 함께 팀 홈으로 이동한다. */
export const useMeetingDelete = ({ teamId, meetingId }: UseMeetingDeleteParams) => {
  const redirectAfterDelete = useMeetingDeletedRedirect(teamId);
  const { showToast } = useAppToast();
  const { remove } = useMeetingExit(String(meetingId));

  const requestDelete = async () => {
    try {
      await remove();
      redirectAfterDelete();
    } catch {
      showToast('회의 삭제에 실패했습니다', 'danger');
    }
  };

  return { requestDelete };
};
