'use client';

import { useState } from 'react';
import { getMeetingPhase, isRecordingStartedByMe } from './meeting-phase';
import { useCurrentMeetingData } from './useCurrentMeetingData';
import { useCurrentMeetingRecordingSession } from './useCurrentMeetingRecordingSession';
import { useRecordingStartDialog } from './useRecordingStartDialog';

interface UseCurrentMeetingRecordingParams {
  teamId: string;
  meetingId: number;
  previewState?: string;
  previewRole: 'recorder' | 'participant';
  /** 지금 이 화면을 보는 사용자의 팀원 ID. 새로고침 후 녹음자 권한 복원에 쓴다 */
  myTeamMemberId: number | null;
}

/** 현재 회의 화면이 쓰는 회의 정보, 녹음 시작 모달, 녹음 세션, 진행 단계를 한 번에 조립한다. */
export const useCurrentMeetingRecording = ({
  teamId,
  meetingId,
  previewState,
  previewRole,
  myTeamMemberId,
}: UseCurrentMeetingRecordingParams) => {
  const isPreview = previewState !== undefined;
  const { meeting, isMeetingPending, isServerCompleted } = useCurrentMeetingData({
    meetingId,
    previewState,
  });
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
    isPreview,
    previewConnectionStatus: meeting?.connectionStatus ?? 'connected',
    isRecordingAcknowledged,
    isRecorderByServer,
    serverRecordingSessionId: meeting?.recordingSessionId ?? null,
    serverRecordingStartedAt: meeting?.recordingStartedAt ?? null,
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
      isPreview,
      isPreviewEnding: isPreview && previewState === 'ending',
      previewRole,
      isBrowserRecording: recorderStatus === 'recording',
      isBrowserPaused: recorderStatus === 'paused',
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
    isWaiting,
    isPaused,
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
