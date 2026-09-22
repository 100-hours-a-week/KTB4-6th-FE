'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppToast } from '@/shared/ui';
import { useMeetingSse } from '../model/meeting-sse-provider';

interface MeetingSseConnectionProps {
  meetingId: string;
  teamId: string;
}

export function MeetingSseConnection({ meetingId, teamId }: MeetingSseConnectionProps) {
  const router = useRouter();
  const { showToast } = useAppToast();
  const { connect, subscribeDeleted } = useMeetingSse();

  useEffect(() => {
    connect(meetingId);
  }, [connect, meetingId]);

  useEffect(() => {
    const unsubscribeDeleted = subscribeDeleted(meetingId, () => {
      showToast('회의가 삭제되어 팀 홈으로 이동합니다.', 'danger');
      router.replace(`/teams/${encodeURIComponent(teamId)}`);
    });

    // 페이지 이동은 회의 나가기가 아니므로 여기서 연결을 닫지 않는다.
    return unsubscribeDeleted;
  }, [meetingId, router, showToast, subscribeDeleted, teamId]);

  return null;
}
