'use client';

import { useMeetingSse } from '@/features/meeting-sse';
import { useRecordingWebSocket } from '@/features/recording-websocket';

export type CurrentMeetingConnectionStatus = 'connecting' | 'connected' | 'error';

interface UseCurrentMeetingConnectionParams {
  meetingId: number;
  recordingSessionId: number | null;
  isPreview: boolean;
  previewConnectionStatus: 'connected' | 'disconnected';
  /** 사용자가 직접 일시정지해서 오디오 소켓을 일부러 끊어둔 상태인지 */
  isPausedByUser: boolean;
}

/** 회의 SSE와 녹음 오디오 소켓의 연결 상태를 화면에서 쓰는 하나의 상태로 합친다. */
export const useCurrentMeetingConnection = ({
  meetingId,
  recordingSessionId,
  isPreview,
  previewConnectionStatus,
  isPausedByUser,
}: UseCurrentMeetingConnectionParams): CurrentMeetingConnectionStatus => {
  const { statuses: sseStatuses } = useMeetingSse();
  const { statuses: socketStatuses } = useRecordingWebSocket();

  if (isPreview) return previewConnectionStatus === 'disconnected' ? 'error' : 'connected';

  const sseStatus = sseStatuses[String(meetingId)];
  const socketStatus = recordingSessionId === null ? undefined : socketStatuses[recordingSessionId];
  const hasConnectionError =
    sseStatus === 'error' ||
    sseStatus === 'unconfigured' ||
    // 일시정지 중엔 소켓을 일부러 끊어둔 것이라 socketStatus가 error/unconfigured여도 문제가 아니다.
    (!isPausedByUser && (socketStatus === 'error' || socketStatus === 'unconfigured'));

  if (hasConnectionError) return 'error';

  return sseStatus === 'connected' &&
    (recordingSessionId === null || socketStatus === 'connected' || isPausedByUser)
    ? 'connected'
    : 'connecting';
};
