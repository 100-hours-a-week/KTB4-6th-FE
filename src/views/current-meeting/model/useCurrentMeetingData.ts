'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMeetingTranscript } from '@/features/meeting';
import {
  getCurrentMeetingQueryKey,
  getCurrentMeetingState,
  useMeetingSse,
} from '@/features/meeting-sse';
import type { TeamMemberData } from '@/features/team-management';
import { mergeTranscriptSegments } from './merge-transcript-segments';
import type { CurrentMeetingViewModel } from './current-meeting';

export const useCurrentMeetingData = (
  meetingId: number,
  teamMembers: TeamMemberData[] | undefined,
) => {
  const { transcriptsByMeetingId, speakerNamesByMeetingId } = useMeetingSse();
  const currentMeetingQuery = useQuery({
    queryKey: getCurrentMeetingQueryKey(meetingId),
    queryFn: () => getCurrentMeetingState(meetingId),
    refetchOnWindowFocus: true,
  });
  const transcriptHistoryQuery = useMeetingTranscript(meetingId);
  const [hasSettledTranscriptHistory, setHasSettledTranscriptHistory] = useState(
    !transcriptHistoryQuery.isPending,
  );
  if (!hasSettledTranscriptHistory && !transcriptHistoryQuery.isPending) {
    setHasSettledTranscriptHistory(true);
  }
  const recordingStartedByTeamMemberId =
    currentMeetingQuery.data?.recordingStartedByTeamMemberId ?? null;
  const recorderName =
    teamMembers?.find((member) => member.teamMemberId === recordingStartedByTeamMemberId)
      ?.displayName ?? '';
  const meeting: CurrentMeetingViewModel | null = currentMeetingQuery.data
    ? {
        title: currentMeetingQuery.data.title,
        recorderName,
        attendees: currentMeetingQuery.data.attendees,
        scheduledAt: currentMeetingQuery.data.scheduledAt,
        targetMinutes: currentMeetingQuery.data.targetMinutes,
        purpose: currentMeetingQuery.data.purpose,
        note: currentMeetingQuery.data.note,
        createdByTeamMemberId: currentMeetingQuery.data.createdByTeamMemberId,
        recordingStartedByTeamMemberId: currentMeetingQuery.data.recordingStartedByTeamMemberId,
        recordingSessionId: currentMeetingQuery.data.recordingSessionId,
        recordingStartedAt: currentMeetingQuery.data.recordingStartedAt,
        recordingPausedAt: currentMeetingQuery.data.recordingPausedAt,
        recordingTotalPausedDurationMs: currentMeetingQuery.data.recordingTotalPausedDurationMs,
        recordingStatus:
          currentMeetingQuery.data.meetingStatus === 'WAITING'
            ? 'waiting'
            : currentMeetingQuery.data.recordingStatus === 'PAUSED'
              ? 'paused'
              : 'recording',
        transcripts: hasSettledTranscriptHistory
          ? mergeTranscriptSegments(
              transcriptHistoryQuery.data ?? [],
              transcriptsByMeetingId[String(meetingId)] ?? [],
              speakerNamesByMeetingId[String(meetingId)] ?? {},
            )
          : [],
      }
    : null;

  return {
    meeting,
    isMeetingPending: currentMeetingQuery.isPending,
    isServerCompleted: currentMeetingQuery.data?.meetingStatus === 'COMPLETED',
    isTranscriptHistoryPending: !hasSettledTranscriptHistory,
    isTranscriptHistoryError: transcriptHistoryQuery.isError,
  };
};
