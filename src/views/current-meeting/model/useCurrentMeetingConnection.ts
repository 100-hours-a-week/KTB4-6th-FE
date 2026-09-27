'use client';

import { useMeetingSse } from '@/features/meeting-sse';
import { useRecordingWebSocket } from '@/features/recording-websocket';

export type CurrentMeetingConnectionStatus = 'connecting' | 'connected' | 'error';

interface UseCurrentMeetingConnectionParams {
  meetingId: number;
  recordingSessionId: number | null;
  isPreview: boolean;
  previewConnectionStatus: 'connected' | 'disconnected';
}

/** 회의 SSE와 녹음 오디오 소켓의 연결 상태를 화면에서 쓰는 하나의 상태로 합친다. */
export const useCurrentMeetingConnection = ({
  meetingId,
  recordingSessionId,
  isPreview,
  previewConnectionStatus,
}: UseCurrentMeetingConnectionParams): CurrentMeetingConnectionStatus => {
  const { statuses: sseStatuses } = useMeetingSse();
  const { statuses: socketStatuses } = useRecordingWebSocket();

  if (isPreview) return previewConnectionStatus === 'disconnected' ? 'error' : 'connected';

  const sseStatus = sseStatuses[String(meetingId)];
  const socketStatus = recordingSessionId === null ? undefined : socketStatuses[recordingSessionId];
  const hasConnectionError =
    sseStatus === 'error' ||
    sseStatus === 'unconfigured' ||
    socketStatus === 'error' ||
    socketStatus === 'unconfigured';

  if (hasConnectionError) return 'error';

  return sseStatus === 'connected' && (recordingSessionId === null || socketStatus === 'connected')
    ? 'connected'
    : 'connecting';
};
