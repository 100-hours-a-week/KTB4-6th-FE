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
  /** 서버가 이 사용자를 녹음 시작자로 기억하고 있는지 */
  isRecorderByServer: boolean;
  /** 서버가 알고 있는 녹음 세션 ID. 로컬 녹음 세션이 없을 때 복원하는 데 쓴다 */
  serverRecordingSessionId: number | null;
  /** 서버가 알고 있는 녹음 시작 시각. 로컬 녹음 세션이 없을 때 복원하는 데 쓴다 */
  serverRecordingStartedAt: string | null;
  /** 서버 기준으로 지금 녹음이 일시정지 상태인지 */
  isServerPaused: boolean;
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
  isRecordingAcknowledged,
  isRecorderByServer,
  serverRecordingSessionId,
  serverRecordingStartedAt,
  isServerPaused,
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
  // 이 브라우저가 아니어도, 같은 팀의 다른 회의가 이미 진행 중이면 새로 시작할 수 없다.
  const { activeMeeting: teamActiveMeeting } = useActiveMeeting(Number(teamId));
  const hasTeamActiveMeetingElsewhere =
    teamActiveMeeting !== null && teamActiveMeeting.meetingId !== meetingId;

  const localRecordingSessionId =
    activeRecording?.meetingId === meetingId ? activeRecording.recordingSessionId : null;
  // 새로고침 등으로 로컬 녹음 세션이 없어도, 서버가 이 사용자를 녹음 시작자로 기억하고
  // 있으면 서버 값으로 대체한다.
  const recordingSessionId =
    localRecordingSessionId ?? (isRecorderByServer ? serverRecordingSessionId : null);

  // RecordingSessionManager는 이 화면과 별개로 동작해서 서버 조회 결과를 직접 못 보기
  // 때문에, 복원한 recordingSessionId를 store에도 채워 넣어야 재생성·재연결을 시도할 수 있다.
  useEffect(() => {
    if (localRecordingSessionId !== null || !isRecorderByServer) return;
    if (serverRecordingSessionId === null) return;

    setActiveRecording({
      teamId,
      meetingId,
      recordingSessionId: serverRecordingSessionId,
      startedAt: serverRecordingStartedAt
        ? new Date(serverRecordingStartedAt).getTime()
        : Date.now(),
    });
    // 일시정지 여부는 메모리에만 있어서 새로고침하면 사라진다. 서버가 일시정지라고 하면
    // 같이 복원해야 한다 — 안 그러면 recorder가 없는 걸 "복구해야 할 문제"로 보고
    // 마이크·웹소켓을 자동으로 다시 만들어 일시정지가 저절로 풀려버린다.
    if (isServerPaused) setIsPausedByUser(true);
  }, [
    localRecordingSessionId,
    isRecorderByServer,
    serverRecordingSessionId,
    serverRecordingStartedAt,
    isServerPaused,
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
    // 일시정지 중엔 recorder 자체가 없어서 recorderStatus가 'idle'이 된다 — isPausedByUser로
    // "일시정지라서 없는 것"과 "연결이 끊겨서 없는 것"을 구분해 버튼이 계속 눌리게 한다.
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
