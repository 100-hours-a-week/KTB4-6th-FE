import type { RecordingBlockedReason } from './blocked-action-toasts';
import type { CurrentMeetingConnectionStatus } from './useCurrentMeetingConnection';

interface RecordingAvailabilityInput {
  isPreview: boolean;
  isWaiting: boolean;
  isCompleted: boolean;
  isStartingRecording: boolean;
  isUploadCompleted: boolean;
  isOperationIdle: boolean;
  isBrowserRecorderActive: boolean;
  hasActiveRecording: boolean;
  /** 이 브라우저가 아니어도, 같은 팀의 다른 회의가 이미 진행 중인지 */
  hasTeamActiveMeetingElsewhere: boolean;
  hasRecordingSession: boolean;
  connectionStatus: CurrentMeetingConnectionStatus;
}

/**
 * 녹음 시작·일시정지·종료 버튼의 사용 가능 여부와, 막혀 있을 때 안내할 사유를 판단한다.
 * 버튼은 막혀 있어도 눌렀을 때 사유를 토스트로 알려야 해서 사유를 함께 반환한다.
 */
export const getRecordingAvailability = ({
  isPreview,
  isWaiting,
  isCompleted,
  isStartingRecording,
  isUploadCompleted,
  isOperationIdle,
  isBrowserRecorderActive,
  hasActiveRecording,
  hasTeamActiveMeetingElsewhere,
  hasRecordingSession,
  connectionStatus,
}: RecordingAvailabilityInput) => {
  const connectionBlockedReason: RecordingBlockedReason | null =
    connectionStatus === 'error'
      ? 'disconnected'
      : connectionStatus === 'connecting'
        ? 'connecting'
        : null;
  const startBlockedReason: RecordingBlockedReason | null =
    !isWaiting || isPreview || isStartingRecording
      ? null
      : (connectionBlockedReason ??
        (hasActiveRecording
          ? 'other-recording'
          : hasTeamActiveMeetingElsewhere
            ? 'team-recording'
            : null));
  const pauseResumeBlockedReason: RecordingBlockedReason | null =
    !isPreview && hasRecordingSession && !isCompleted && !isUploadCompleted && isOperationIdle
      ? connectionBlockedReason
      : null;

  return {
    canStartRecording:
      isWaiting && !isPreview && !isStartingRecording && startBlockedReason === null,
    startBlockedReason,
    canPauseResumeRecording:
      !isPreview &&
      hasRecordingSession &&
      connectionStatus === 'connected' &&
      isBrowserRecorderActive &&
      !isCompleted &&
      !isUploadCompleted &&
      isOperationIdle,
    pauseResumeBlockedReason,
    canCompleteRecording: hasRecordingSession && !isCompleted && isOperationIdle && !isPreview,
  };
};
