'use client';

import { lazy, Suspense, useState } from 'react';
import {
  PREFETCHED_MEETING_STALE_TIME,
  useMeetingDetail,
  useMeetingTranscript,
} from '@/features/meeting';
import { MeetingRouteLoadingState } from './MeetingRouteLoadingState';

const CurrentMeetingPage = lazy(() =>
  import('@/views/current-meeting').then((module) => ({ default: module.CurrentMeetingPage })),
);
const CompletedMeetingPage = lazy(() =>
  import('@/views/completed-meeting').then((module) => ({
    default: module.CompletedMeetingPage,
  })),
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

  const loadingState = (
    <MeetingRouteLoadingState
      isPending={!meetingQuery.isError}
      teamHomeHref={`/teams/${encodeURIComponent(teamId)}`}
    />
  );
  if (isInitiallyCompleted === null) return loadingState;

  const completedPage = <CompletedMeetingPage teamId={teamId} meetingId={meetingId} />;

  return (
    <Suspense fallback={loadingState}>
      {isInitiallyCompleted ? (
        completedPage
      ) : (
        <CurrentMeetingPage teamId={teamId} meetingId={meetingId} completedView={completedPage} />
      )}
    </Suspense>
  );
};
