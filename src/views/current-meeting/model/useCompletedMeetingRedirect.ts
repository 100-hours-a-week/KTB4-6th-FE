'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getCurrentMeetingQueryKey } from './current-meeting-query-key';

// 종료 회의 화면의 기본 탭. views끼리는 import할 수 없어 값만 맞춘다.
const COMPLETED_MEETING_TAB = 'summary';

interface UseCompletedMeetingRedirectParams {
  teamId: string;
  meetingId: number;
  isPreview: boolean;
  isMeetingLoaded: boolean;
  hasCompleted: boolean;
}

/**
 * 진행 중이던 회의가 종료되면 종료 회의 주소(?tab=summary)로 이동한다. 진행자와 참여자가 함께 쓴다.
 * 진행자는 업로드와 종료 요청이 끝나 종료로 확인된 뒤, 참여자는 종료 이벤트로 종료가 확인된 뒤 이동한다.
 * 종료된 회의를 처음부터 열었다면 주소를 바꾸지 않는다.
 */
export const useCompletedMeetingRedirect = ({
  teamId,
  meetingId,
  isPreview,
  isMeetingLoaded,
  hasCompleted,
}: UseCompletedMeetingRedirectParams) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const wasLiveRef = useRef(false);

  useEffect(() => {
    if (isPreview || !isMeetingLoaded) return;

    if (!hasCompleted) {
      wasLiveRef.current = true;
      return;
    }

    if (!wasLiveRef.current) return;
    wasLiveRef.current = false;

    // 이 브라우저에서 종료한 경우 서버 상태가 아직 갱신 전일 수 있어 먼저 다시 조회한다.
    void queryClient.invalidateQueries({ queryKey: getCurrentMeetingQueryKey(meetingId) });
    router.replace(
      `/teams/${encodeURIComponent(teamId)}/meetings/${meetingId}?tab=${COMPLETED_MEETING_TAB}`,
    );
  }, [hasCompleted, isMeetingLoaded, isPreview, meetingId, queryClient, router, teamId]);
};
