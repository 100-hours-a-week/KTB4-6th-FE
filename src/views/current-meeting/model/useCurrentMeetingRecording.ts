'use client';

import { useState } from 'react';
import { getMeetingPreview } from './preview-meeting';
import { useCurrentMeetingRecordingSession } from './useCurrentMeetingRecordingSession';

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
  const meeting = getMeetingPreview(previewState);

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
    canPauseResumeRecording,
    canCompleteRecording,
    handleConfirmRecording,
    handlePauseResumeRecording,
    handleCompleteRecording,
  } = useCurrentMeetingRecordingSession({
    teamId,
    meetingId,
    isMeetingWaiting: meeting.recordingStatus === 'waiting',
    isPreview: previewState !== undefined,
    previewConnectionStatus: meeting.connectionStatus,
    isRecordingAcknowledged,
    onRecordingStarted: () => handleStartDialogOpenChange(false),
  });

  const isWaiting =
    meeting.recordingStatus === 'waiting' && recordingSessionId === null && !isCompleted;
  const isPaused =
    previewState === undefined
      ? recordingSessionId !== null && recorderStatus === 'paused'
      : meeting.recordingStatus === 'paused';
  const isEnding =
    meeting.recordingStatus === 'ending' ||
    (recordingSessionId !== null && operation === 'finishing');
  const isDisconnected = connectionStatus === 'error';
  const isRecording =
    (previewState === undefined
      ? recordingSessionId !== null && recorderStatus === 'recording'
      : meeting.recordingStatus === 'recording') &&
    !isDisconnected &&
    !isCompleted;
  const isRecorder = previewRole === 'recorder' || recordingSessionId !== null;

  const handleStartRecording = () => {
    if (!canStartRecordingSession || isStartDialogOpen) return;
    setIsStartDialogOpen(true);
  };

  return {
    meeting,
    isWaiting,
    isPaused,
    isEnding,
    connectionStatus,
    isDisconnected,
    isRecording,
    isRecorder,
    isCompleted,
    isStartDialogOpen,
    isRecordingAcknowledged,
    isStartingRecording,
    isUpdatingRecordingStatus: operation === 'updating',
    canStartRecording: canStartRecordingSession && !isStartDialogOpen,
    canPauseResumeRecording,
    canCompleteRecording,
    setIsRecordingAcknowledged,
    handleStartRecording,
    handleStartDialogOpenChange,
    handleConfirmRecording,
    handlePauseResumeRecording,
    handleCompleteRecording,
  };
};
