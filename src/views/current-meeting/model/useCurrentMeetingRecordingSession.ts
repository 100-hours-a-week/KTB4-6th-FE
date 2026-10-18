'use client';

import { useEffect, useState } from 'react';
import { useActiveMeeting } from '@/features/home';
import { useMediaRecorder, useRecordingSessionStore } from '@/features/recording';
import { getRecordingAvailability } from './recording-availability';
import { useCompleteRecordingFlow } from './useCompleteRecordingFlow';
import { useCurrentMeetingConnection } from './useCurrentMeetingConnection';
import { usePauseResumeRecordingFlow } from './usePauseResumeRecordingFlow';
import { useStartRecordingFlow } from './useStartRecordingFlow';

interface UseCurrentMeetingRecordingSessionParams {
  teamId: string;
  meetingId: number;
  isMeetingWaiting: boolean;
  isRecordingAcknowledged: boolean;
  isRecorderByServer: boolean;
  serverRecordingSessionId: number | null;
  serverRecordingStartedAt: string | null;
  isServerPaused: boolean;
  isServerCompleted: boolean;
  onRecordingStarted: () => void;
  onInsufficientCredit: () => void;
}

export const useCurrentMeetingRecordingSession = ({
  teamId,
  meetingId,
  isMeetingWaiting,
  isRecordingAcknowledged,
  isRecorderByServer,
  serverRecordingSessionId,
  serverRecordingStartedAt,
  isServerPaused,
  isServerCompleted,
  onRecordingStarted,
  onInsufficientCredit,
}: UseCurrentMeetingRecordingSessionParams) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const recorderStatus = useMediaRecorder((state) => state.status);
  const activeRecording = useRecordingSessionStore((state) => state.activeRecording);
  const setActiveRecording = useRecordingSessionStore((state) => state.setActiveRecording);
  const setIsPausedByUser = useRecordingSessionStore((state) => state.setIsPausedByUser);
  const pendingUpload = useRecordingSessionStore((state) => state.pendingUpload);
  const operation = useRecordingSessionStore((state) => state.operation);
  const isPausedByUser = useRecordingSessionStore((state) => state.isPausedByUser);
  const { activeMeeting: teamActiveMeeting } = useActiveMeeting(Number(teamId));
  const hasTeamActiveMeetingElsewhere =
    teamActiveMeeting !== null && teamActiveMeeting.meetingId !== meetingId;

  const localRecordingSessionId =
    activeRecording?.meetingId === meetingId ? activeRecording.recordingSessionId : null;
  const recordingSessionId =
    localRecordingSessionId ?? (isRecorderByServer ? serverRecordingSessionId : null);

  useEffect(() => {
    if (localRecordingSessionId !== null || !isRecorderByServer) return;
    if (serverRecordingSessionId === null) return;
    if (isServerCompleted || isCompleted || operation === 'finishing') return;

    setActiveRecording({
      teamId,
      meetingId,
      recordingSessionId: serverRecordingSessionId,
      startedAt: serverRecordingStartedAt
        ? new Date(serverRecordingStartedAt).getTime()
        : Date.now(),
    });
    if (isServerPaused) setIsPausedByUser(true);
  }, [
    localRecordingSessionId,
    isRecorderByServer,
    serverRecordingSessionId,
    serverRecordingStartedAt,
    isServerPaused,
    isServerCompleted,
    isCompleted,
    operation,
    teamId,
    meetingId,
    setActiveRecording,
    setIsPausedByUser,
  ]);

  const connectionStatus = useCurrentMeetingConnection({
    meetingId,
    recordingSessionId,
    isPausedByUser,
  });
  const isWaiting = isMeetingWaiting && recordingSessionId === null && !isCompleted;
  const isStartingRecording = operation === 'starting';
  const isUploadCompleted =
    pendingUpload?.recordingSessionId === recordingSessionId && pendingUpload.isCompleted;
  const availability = getRecordingAvailability({
    isWaiting,
    isCompleted,
    isStartingRecording,
    isUploadCompleted,
    isOperationIdle: operation === 'idle',
    isBrowserRecorderActive: recorderStatus === 'recording' || isPausedByUser,
    hasActiveRecording: activeRecording !== null,
    hasTeamActiveMeetingElsewhere,
    hasRecordingSession: recordingSessionId !== null,
    connectionStatus,
    isPausedByUser,
  });

  const handleConfirmRecording = useStartRecordingFlow({
    teamId,
    meetingId,
    isWaiting,
    isRecordingAcknowledged,
    onRecordingStarted,
    onInsufficientCredit,
  });
  const handleCompleteRecording = useCompleteRecordingFlow({
    recordingSessionId,
    isCompleted,
    onCompleted: () => setIsCompleted(true),
  });
  const handlePauseResumeRecording = usePauseResumeRecordingFlow({
    recordingSessionId,
    canPauseResumeRecording: availability.canPauseResumeRecording,
  });

  return {
    recordingSessionId,
    recorderStatus,
    isPausedByUser,
    operation,
    connectionStatus,
    isCompleted,
    isStartingRecording,
    ...availability,
    handleConfirmRecording,
    handlePauseResumeRecording,
    handleCompleteRecording,
  };
};
