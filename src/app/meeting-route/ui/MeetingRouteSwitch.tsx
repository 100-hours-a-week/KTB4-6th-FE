'use client';

import { lazy, Suspense, useState } from 'react';
import { useMeetingDetail, useMeetingTranscript } from '@/features/meeting';
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
  // 종료 회의 화면과 같은 쿼리로 조회해, 그 화면이 회의 정보를 다시 기다리지 않게 한다.
  const meetingQuery = useMeetingDetail(meetingId);
  // 어느 화면으로 가든 과거 전사가 필요해서, 회의 상태 조회와 동시에 시작한다.
  useMeetingTranscript(meetingId);
  // 진행 중에 회의가 끝나면 CurrentMeetingPage가 종료 안내를 거쳐 종료 화면으로 넘기므로,
  // 여기서는 처음 받은 상태로만 화면을 고른다.
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
