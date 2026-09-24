'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getCurrentMeetingState,
  type TranscriptCreatedEventData,
  useMeetingSse,
} from '@/features/meeting-sse';
import { getMeetingPreview, mockMeetingInfo, type TranscriptSegment } from './preview-meeting';
import { useCurrentMeetingRecordingSession } from './useCurrentMeetingRecordingSession';

const toTranscriptSegment = (transcript: TranscriptCreatedEventData): TranscriptSegment => ({
  id: String(transcript.transcriptSegmentId),
  speakerNumber: null,
  startedAtSeconds: Math.floor(transcript.startedAtMs / 1000),
  text: transcript.text,
});

interface UseCurrentMeetingRecordingParams {
  teamId: string;
  meetingId: number;
  previewState?: string;
  previewRole: 'recorder' | 'participant';
}

export const useCurrentMeetingRecording = ({
  teamId,
  meetingId,
  previewState,
  previewRole,
}: UseCurrentMeetingRecordingParams) => {
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isRecordingAcknowledged, setIsRecordingAcknowledged] = useState(false);
  const { transcriptsByMeetingId } = useMeetingSse();
  const isPreview = previewState !== undefined;
  const currentMeetingQuery = useQuery({
    queryKey: ['meetings', meetingId, 'current-state'],
    queryFn: () => getCurrentMeetingState(meetingId),
    enabled: !isPreview,
  });
  const meeting = isPreview
    ? getMeetingPreview(previewState)
    : currentMeetingQuery.data
      ? {
          title: currentMeetingQuery.data.title,
          recorderName: currentMeetingQuery.data.recorderName,
          participantCount: currentMeetingQuery.data.participantCount,
          participantLimit: 5,
          targetMinutes: currentMeetingQuery.data.targetMinutes,
          ...mockMeetingInfo,
          elapsedSeconds: 0,
          recordingStatus:
            currentMeetingQuery.data.meetingStatus === 'WAITING'
              ? ('waiting' as const)
              : currentMeetingQuery.data.recordingStatus === 'PAUSED'
                ? ('paused' as const)
                : ('recording' as const),
          connectionStatus: 'connected' as const,
          transcripts: (transcriptsByMeetingId[String(meetingId)] ?? []).map(toTranscriptSegment),
        }
      : null;

  const handleStartDialogOpenChange = (open: boolean) => {
    setIsStartDialogOpen(open);
    if (!open) setIsRecordingAcknowledged(false);
  };

  const {
    recordingSessionId,
    recorderStatus,
    operation,
    connectionStatus,
    isCompleted,
    isStartingRecording,
    canStartRecording: canStartRecordingSession,
    startBlockedReason,
    canPauseResumeRecording,
    pauseResumeBlockedReason,
    canCompleteRecording,
    handleConfirmRecording,
    handlePauseResumeRecording,
    handleCompleteRecording,
  } = useCurrentMeetingRecordingSession({
    teamId,
    meetingId,
    isMeetingWaiting: meeting?.recordingStatus === 'waiting',
    isPreview,
    previewConnectionStatus: meeting?.connectionStatus ?? 'connected',
    isRecordingAcknowledged,
    onRecordingStarted: () => handleStartDialogOpenChange(false),
  });

  const isServerCompleted = currentMeetingQuery.data?.meetingStatus === 'COMPLETED';
  const hasCompleted = isServerCompleted || isCompleted;
  const isWaiting =
    meeting?.recordingStatus === 'waiting' && recordingSessionId === null && !hasCompleted;
  const isPaused =
    isPreview || recordingSessionId === null
      ? meeting?.recordingStatus === 'paused'
      : recorderStatus === 'paused';
  const isEnding =
    (isPreview && previewState === 'ending') ||
    (recordingSessionId !== null && operation === 'finishing');
  const isDisconnected = connectionStatus === 'error';
  const isRecording =
    (isPreview || recordingSessionId === null
      ? meeting?.recordingStatus === 'recording'
      : recorderStatus === 'recording') &&
    !isDisconnected &&
    !hasCompleted;
  const isRecorder =
    !hasCompleted && (isPreview ? previewRole === 'recorder' : recordingSessionId !== null);

  const handleStartRecording = () => {
    if (!canStartRecordingSession || isStartDialogOpen) return;
    setIsStartDialogOpen(true);
  };

  return {
    meeting,
    isMeetingPending: !isPreview && currentMeetingQuery.isPending,
    isWaiting,
    isPaused,
    isEnding,
    connectionStatus,
    isDisconnected,
    isRecording,
    isRecorder,
    isCompleted: hasCompleted,
    isStartDialogOpen,
    isRecordingAcknowledged,
    isStartingRecording,
    isUpdatingRecordingStatus: operation === 'updating',
    canStartRecording: canStartRecordingSession && !isStartDialogOpen,
    startBlockedReason,
    pauseResumeBlockedReason,
    canPauseResumeRecording: canPauseResumeRecording && !hasCompleted,
    canCompleteRecording: canCompleteRecording && !hasCompleted,
    setIsRecordingAcknowledged,
    handleStartRecording,
    handleStartDialogOpenChange,
    handleConfirmRecording,
    handlePauseResumeRecording,
    handleCompleteRecording,
  };
};
