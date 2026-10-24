'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  PREFETCHED_MEETING_STALE_TIME,
  useMeetingDetail,
  useMeetingTranscript,
} from '@/features/meeting';
import { MeetingRouteLoadingState } from './MeetingRouteLoadingState';

const CurrentMeetingPage = dynamic(() =>
  import('@/views/current-meeting').then((module) => module.CurrentMeetingPage),
);
const CompletedMeetingPage = dynamic(() =>
  import('@/views/completed-meeting').then((module) => module.CompletedMeetingPage),
);

interface MeetingRouteSwitchProps {
  teamId: string;
  meetingId: number;
}

export const MeetingRouteSwitch = ({ teamId, meetingId }: MeetingRouteSwitchProps) => {
  const meetingQuery = useMeetingDetail(meetingId, { staleTime: PREFETCHED_MEETING_STALE_TIME });
  useMeetingTranscript(meetingId, { staleTime: PREFETCHED_MEETING_STALE_TIME });
  const [isInitiallyCompleted, setIsInitiallyCompleted] = useState<boolean | null>(null);
  if (isInitiallyCompleted === null && meetingQuery.data) {
    setIsInitiallyCompleted(meetingQuery.data.status === 'COMPLETED');
  }

  if (isInitiallyCompleted === null) {
    return (
      <MeetingRouteLoadingState
        isPending={!meetingQuery.isError}
        teamHomeHref={`/teams/${encodeURIComponent(teamId)}`}
      />
    );
  }

  const completedPage = <CompletedMeetingPage teamId={teamId} meetingId={meetingId} />;

  return isInitiallyCompleted ? (
    completedPage
  ) : (
    <CurrentMeetingPage teamId={teamId} meetingId={meetingId} completedView={completedPage} />
  );
};
