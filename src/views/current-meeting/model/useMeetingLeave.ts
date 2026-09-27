'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMeetingExit } from '@/features/meeting-sse';
import { useAppToast } from '@/shared/ui';

interface UseMeetingLeaveParams {
  teamId: string;
  meetingId: string;
}

/** 회의 나가기 요청과 진행 상태를 관리하고, 성공하면 팀 홈으로 이동한다. */
export const useMeetingLeave = ({ teamId, meetingId }: UseMeetingLeaveParams) => {
  const router = useRouter();
  const { showToast } = useAppToast();
  const { leave } = useMeetingExit(meetingId);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeave = async () => {
    if (isLeaving) return;

    setIsLeaving(true);
    try {
      await leave();
      router.replace(`/teams/${encodeURIComponent(teamId)}`);
    } catch {
      showToast('회의 나가기에 실패했습니다', 'danger');
      setIsLeaving(false);
    }
  };

  return { isLeaving, handleLeave };
};
