'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getTeamHomePath, homeKeys } from '@/features/home';
import { getCurrentMeetingQueryKey } from './current-meeting-query-key';

// 종료 회의 화면의 기본 탭. views끼리는 import할 수 없어 값만 맞춘다.
const COMPLETED_MEETING_TAB = 'summary';

interface UseMeetingEndedNoticeParams {
  teamId: string;
  meetingId: number;
  isPreview: boolean;
  isMeetingLoaded: boolean;
  hasCompleted: boolean;
}

/**
 * 진행 중이던 회의가 종료되면 종료 안내 모달을 열고, 진행자와 참여자가 함께 쓴다.
 * 진행자는 업로드와 종료 요청이 끝나 종료로 확인된 뒤, 참여자는 종료 이벤트로 종료가 확인된 뒤 연다.
 * 모달에서 회의 결과 화면(?tab=summary) 또는 홈으로 이동한다.
 * 종료된 회의를 처음부터 열었다면 안내하지 않는다.
 */
export const useMeetingEndedNotice = ({
  teamId,
  meetingId,
  isPreview,
  isMeetingLoaded,
  hasCompleted,
}: UseMeetingEndedNoticeParams) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [wasLive, setWasLive] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // 이 화면에서 진행 중인 회의를 본 적이 있어야 종료 안내 대상이다.
  if (!isPreview && isMeetingLoaded && !hasCompleted && !wasLive) setWasLive(true);

  const isMeetingEndedNoticeOpen = wasLive && hasCompleted && !isConfirmed;

  const goToResult = () => {
    setIsConfirmed(true);
    // 이 브라우저에서 종료한 경우 서버 상태가 아직 갱신 전일 수 있어 먼저 다시 조회한다.
    void queryClient.invalidateQueries({ queryKey: getCurrentMeetingQueryKey(meetingId) });
    router.replace(
      `/teams/${encodeURIComponent(teamId)}/meetings/${meetingId}?tab=${COMPLETED_MEETING_TAB}`,
    );
  };

  const goHome = () => {
    void queryClient.invalidateQueries({ queryKey: homeKeys.all });
    router.replace(getTeamHomePath(teamId));
  };

  return { isMeetingEndedNoticeOpen, goToResult, goHome };
};
