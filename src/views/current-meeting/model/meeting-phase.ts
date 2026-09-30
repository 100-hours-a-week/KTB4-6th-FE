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
  /** 서버가 이 사용자를 녹음 시작자로 기억하고 있는지 */
  isRecorderByServer: boolean;
}

interface IsRecordingStartedByMeInput {
  /** 서버가 알고 있는, 녹음을 시작한 팀원 ID */
  recordingStartedByTeamMemberId: number | null | undefined;
  /** 지금 이 화면을 보는 사용자의 팀원 ID */
  myTeamMemberId: number | null;
}

/**
 * 서버가 이 사용자를 녹음 시작자로 기억하고 있는지 판단한다.
 * 새로고침 등으로 이 브라우저의 녹음 세션이 사라졌어도 판단할 수 있어서 녹음자 권한
 * 복원의 기준으로 쓴다.
 */
export const isRecordingStartedByMe = ({
  recordingStartedByTeamMemberId,
  myTeamMemberId,
}: IsRecordingStartedByMeInput): boolean =>
  myTeamMemberId !== null &&
  recordingStartedByTeamMemberId !== null &&
  recordingStartedByTeamMemberId === myTeamMemberId;

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
  isRecorderByServer,
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
    isRecorder:
      !hasCompleted &&
      (isPreview ? previewRole === 'recorder' : hasRecordingSession || isRecorderByServer),
  };
};
