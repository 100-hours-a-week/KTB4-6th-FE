'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getTeamHomePath, homeKeys } from '@/features/home';
import { meetingKeys } from '@/features/meeting';
import { getCurrentMeetingQueryKey } from '@/features/meeting-sse';

const COMPLETED_MEETING_TAB = 'summary';

interface UseMeetingEndedNoticeParams {
  teamId: string;
  meetingId: number;
  isMeetingLoaded: boolean;
  hasCompleted: boolean;
}

export const useMeetingEndedNotice = ({
  teamId,
  meetingId,
  isMeetingLoaded,
  hasCompleted,
}: UseMeetingEndedNoticeParams) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [wasLive, setWasLive] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (isMeetingLoaded && !hasCompleted && !wasLive) setWasLive(true);

  const isMeetingEndedNoticeOpen = wasLive && hasCompleted && !isConfirmed;

  const goToResult = () => {
    setIsConfirmed(true);
    void queryClient.invalidateQueries({ queryKey: getCurrentMeetingQueryKey(meetingId) });
    void queryClient.resetQueries({ queryKey: meetingKeys.detail(meetingId) });
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
