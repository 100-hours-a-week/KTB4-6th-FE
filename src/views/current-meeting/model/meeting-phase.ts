import type { CurrentMeetingViewModel } from './preview-meeting';
import type { CurrentMeetingConnectionStatus } from './useCurrentMeetingConnection';

interface MeetingPhaseInput {
  serverRecordingStatus: CurrentMeetingViewModel['recordingStatus'] | undefined;
  hasRecordingSession: boolean;
  hasCompleted: boolean;
  isPreview: boolean;
  isPreviewEnding: boolean;
  previewRole: 'recorder' | 'participant';
  isBrowserRecording: boolean;
  isBrowserPaused: boolean;
  isFinishing: boolean;
  connectionStatus: CurrentMeetingConnectionStatus;
}

/**
 * 서버의 회의 상태와 이 브라우저의 녹음 세션을 합쳐 화면이 보여줄 진행 단계를 판단한다.
 * 이 브라우저가 녹음 중이면 브라우저 상태를, 아니면 서버 상태를 기준으로 한다.
 */
export const getMeetingPhase = ({
  serverRecordingStatus,
  hasRecordingSession,
  hasCompleted,
  isPreview,
  isPreviewEnding,
  previewRole,
  isBrowserRecording,
  isBrowserPaused,
  isFinishing,
  connectionStatus,
}: MeetingPhaseInput) => {
  const usesServerStatus = isPreview || !hasRecordingSession;
  const isDisconnected = connectionStatus === 'error';

  return {
    isWaiting: serverRecordingStatus === 'waiting' && !hasRecordingSession && !hasCompleted,
    isPaused: usesServerStatus ? serverRecordingStatus === 'paused' : isBrowserPaused,
    isEnding: isPreviewEnding || (hasRecordingSession && isFinishing),
    isDisconnected,
    isRecording:
      (usesServerStatus ? serverRecordingStatus === 'recording' : isBrowserRecording) &&
      !isDisconnected &&
      !hasCompleted,
    isRecorder: !hasCompleted && (isPreview ? previewRole === 'recorder' : hasRecordingSession),
  };
};
