'use client';

import { useState } from 'react';
import type { TeamMemberData } from '@/features/team-management';
import { getMeetingPhase, isRecordingStartedByMe } from './meeting-phase';
import { useCurrentMeetingData } from './useCurrentMeetingData';
import { useCurrentMeetingRecordingSession } from './useCurrentMeetingRecordingSession';
import { useRecordingStartDialog } from './useRecordingStartDialog';

interface UseCurrentMeetingRecordingParams {
  teamId: string;
  meetingId: number;
  myTeamMemberId: number | null;
  teamMembers: TeamMemberData[] | undefined;
}

export const useCurrentMeetingRecording = ({
  teamId,
  meetingId,
  myTeamMemberId,
  teamMembers,
}: UseCurrentMeetingRecordingParams) => {
  const {
    meeting,
    isMeetingPending,
    isServerCompleted,
    isTranscriptHistoryPending,
    isTranscriptHistoryError,
  } = useCurrentMeetingData(meetingId, teamMembers);
  const {
    isStartDialogOpen,
    isRecordingAcknowledged,
    setIsRecordingAcknowledged,
    handleStartDialogOpenChange,
  } = useRecordingStartDialog();
  const [isInsufficientCreditDialogOpen, setIsInsufficientCreditDialogOpen] = useState(false);
  const isRecorderByServer = isRecordingStartedByMe({
    recordingStartedByTeamMemberId: meeting?.recordingStartedByTeamMemberId,
    myTeamMemberId,
  });

  const {
    recordingSessionId,
    recorderStatus,
    isPausedByUser,
    operation,
    connectionStatus,
    isCompleted,
    isStartingRecording,
    canStartRecording,
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
    isRecordingAcknowledged,
    isRecorderByServer,
    serverRecordingSessionId: meeting?.recordingSessionId ?? null,
    serverRecordingStartedAt: meeting?.recordingStartedAt ?? null,
    isServerPaused: meeting?.recordingStatus === 'paused',
    isServerCompleted,
    onRecordingStarted: () => handleStartDialogOpenChange(false),
    onInsufficientCredit: () => {
      handleStartDialogOpenChange(false);
      setIsInsufficientCreditDialogOpen(true);
    },
  });

  const hasCompleted = isServerCompleted || isCompleted;
  const { isWaiting, isPaused, isEnding, isDisconnected, isRecording, isRecorder } =
    getMeetingPhase({
      serverRecordingStatus: meeting?.recordingStatus,
      hasRecordingSession: recordingSessionId !== null,
      hasCompleted,
      isBrowserRecording: recorderStatus === 'recording',
      isBrowserPaused: isPausedByUser,
      isFinishing: operation === 'finishing',
      connectionStatus,
      isRecorderByServer,
    });

  const handleStartRecording = () => {
    if (!canStartRecording || isStartDialogOpen) return;
    handleStartDialogOpenChange(true);
  };

  return {
    meeting,
    isMeetingPending,
    isTranscriptHistoryPending,
    isTranscriptHistoryError,
    isWaiting,
    isPaused,
    isPausedByUser,
    isEnding,
    connectionStatus,
    isDisconnected,
    isRecording,
    isRecorder,
    isCompleted: hasCompleted,
    isServerCompleted,
    isStartDialogOpen,
    isRecordingAcknowledged,
    isInsufficientCreditDialogOpen,
    isStartingRecording,
    isUpdatingRecordingStatus: operation === 'updating',
    canStartRecording: canStartRecording && !isStartDialogOpen,
    startBlockedReason,
    pauseResumeBlockedReason,
    canPauseResumeRecording: canPauseResumeRecording && !hasCompleted,
    canCompleteRecording: canCompleteRecording && !hasCompleted,
    setIsRecordingAcknowledged,
    setIsInsufficientCreditDialogOpen,
    handleStartRecording,
    handleStartDialogOpenChange,
    handleConfirmRecording,
    handlePauseResumeRecording,
    handleCompleteRecording,
  };
};
