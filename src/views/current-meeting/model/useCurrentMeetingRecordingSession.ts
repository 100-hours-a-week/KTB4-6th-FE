'use client';

import { useState } from 'react';
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
  isPreview: boolean;
  previewConnectionStatus: 'connected' | 'disconnected';
  isRecordingAcknowledged: boolean;
  onRecordingStarted: () => void;
  onInsufficientCredit: () => void;
}

/**
 * 이 브라우저의 녹음 세션 상태를 읽고, 연결 상태·사용 가능 여부·녹음 흐름을 한 화면용으로 조립한다.
 * 각 판단과 흐름은 같은 폴더의 전용 훅·함수가 맡는다.
 */
export const useCurrentMeetingRecordingSession = ({
  teamId,
  meetingId,
  isMeetingWaiting,
  isPreview,
  previewConnectionStatus,
  isRecordingAcknowledged,
  onRecordingStarted,
  onInsufficientCredit,
}: UseCurrentMeetingRecordingSessionParams) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const recorderStatus = useMediaRecorder((state) => state.status);
  const activeRecording = useRecordingSessionStore((state) => state.activeRecording);
  const pendingUpload = useRecordingSessionStore((state) => state.pendingUpload);
  const operation = useRecordingSessionStore((state) => state.operation);

  const recordingSessionId =
    !isPreview && activeRecording?.meetingId === meetingId
      ? activeRecording.recordingSessionId
      : null;
  const connectionStatus = useCurrentMeetingConnection({
    meetingId,
    recordingSessionId,
    isPreview,
    previewConnectionStatus,
  });
  const isWaiting = isMeetingWaiting && recordingSessionId === null && !isCompleted;
  const isStartingRecording = operation === 'starting';
  const isUploadCompleted =
    pendingUpload?.recordingSessionId === recordingSessionId && pendingUpload.isCompleted;
  const availability = getRecordingAvailability({
    isPreview,
    isWaiting,
    isCompleted,
    isStartingRecording,
    isUploadCompleted,
    isOperationIdle: operation === 'idle',
    isBrowserRecorderActive: recorderStatus === 'recording' || recorderStatus === 'paused',
    hasActiveRecording: activeRecording !== null,
    hasRecordingSession: recordingSessionId !== null,
    connectionStatus,
  });

  const handleConfirmRecording = useStartRecordingFlow({
    teamId,
    meetingId,
    isWaiting,
    isPreview,
    isRecordingAcknowledged,
    onRecordingStarted,
    onInsufficientCredit,
  });
  const handleCompleteRecording = useCompleteRecordingFlow({
    recordingSessionId,
    isCompleted,
    isPreview,
    onCompleted: () => setIsCompleted(true),
  });
  const handlePauseResumeRecording = usePauseResumeRecordingFlow({
    recordingSessionId,
    canPauseResumeRecording: availability.canPauseResumeRecording,
  });

  return {
    recordingSessionId,
    recorderStatus,
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
