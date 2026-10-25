import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { MeetingDetailData } from '@/features/meeting';
import {
  getMeetingDetailOnServer,
  getMeetingTranscriptOnServer,
  meetingKeys,
} from '@/features/meeting/index.server';
import {
  getActiveRecordingOnServer,
  getCurrentMeetingQueryKey,
  toCurrentMeetingState,
} from '@/features/meeting-sse/index.server';
import { MeetingRouteLoadingState } from './MeetingRouteLoadingState';
import { MeetingRouteSwitch } from './MeetingRouteSwitch';

interface MeetingRouteScreenProps {
  teamId: string;
  meetingId: number;
}

const prefetchCurrentMeetingState = async (
  queryClient: QueryClient,
  meeting: MeetingDetailData,
  accessToken: string,
) => {
  const activeRecording =
    meeting.status === 'IN_PROGRESS'
      ? await getActiveRecordingOnServer(meeting.meetingId, accessToken)
      : null;

  queryClient.setQueryData(
    getCurrentMeetingQueryKey(meeting.meetingId),
    toCurrentMeetingState(meeting, activeRecording),
  );
};

const prefetchMeetingRoute = async (
  queryClient: QueryClient,
  meetingId: number,
  accessToken: string,
) => {
  await Promise.allSettled([
    getMeetingDetailOnServer(meetingId, accessToken).then(async (meeting) => {
      queryClient.setQueryData(meetingKeys.detail(meetingId), meeting);
      if (meeting.status !== 'COMPLETED') {
        await prefetchCurrentMeetingState(queryClient, meeting, accessToken);
      }
    }),
    getMeetingTranscriptOnServer(meetingId, accessToken).then((transcript) => {
      queryClient.setQueryData(meetingKeys.transcript(meetingId), transcript);
    }),
  ]);
};

const PrefetchedMeetingRouteSwitch = async ({ teamId, meetingId }: MeetingRouteScreenProps) => {
  const accessToken = (await cookies()).get('accessToken')?.value;
  const queryClient = new QueryClient();

  if (accessToken) {
    await prefetchMeetingRoute(queryClient, meetingId, accessToken);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MeetingRouteSwitch teamId={teamId} meetingId={meetingId} />
    </HydrationBoundary>
  );
};

export const MeetingRouteScreen = ({ teamId, meetingId }: MeetingRouteScreenProps) => (
  <Suspense
    fallback={
      <MeetingRouteLoadingState isPending teamHomeHref={`/teams/${encodeURIComponent(teamId)}`} />
    }
  >
    <PrefetchedMeetingRouteSwitch teamId={teamId} meetingId={meetingId} />
  </Suspense>
);
