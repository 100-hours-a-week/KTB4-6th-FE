'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as Sentry from '@sentry/nextjs';
import type { AudioFormat } from '@/entities/recording';

export type RecordingWebSocketStatus =
  'idle' | 'unconfigured' | 'connecting' | 'connected' | 'error';

interface RecordingWebSocketContextValue {
  statuses: Record<number, RecordingWebSocketStatus>;
  connect: (recordingSessionId: number, audioFormat: AudioFormat) => void;
  sendAudioChunk: (recordingSessionId: number, chunk: Blob) => void;
  disconnect: (recordingSessionId: number) => void;
}

const RecordingWebSocketContext = createContext<RecordingWebSocketContextValue | null>(null);

/** 녹음 음성 전송 연결이 끊긴 사실을 보고한다. 이후 음성은 서버로 실시간 전송되지 않는다. */
const reportSocketFailure = (
  message: string,
  recordingSessionId: number,
  opened: boolean,
  closeEvent?: CloseEvent,
) => {
  Sentry.captureMessage(message, {
    level: 'error',
    tags: {
      feature: 'recording-websocket',
      'recording.session_id': recordingSessionId,
      'connection.phase': opened ? 'connected' : 'connecting',
      'page.visibility': document.visibilityState,
      ...(closeEvent && { 'websocket.close_code': closeEvent.code }),
    },
    ...(closeEvent && {
      contexts: {
        websocket: {
          code: closeEvent.code,
          reason: closeEvent.reason,
          wasClean: closeEvent.wasClean,
        },
      },
    }),
  });
};

export function RecordingWebSocketProvider({ children }: { children: ReactNode }) {
  const sockets = useRef(new Map<number, WebSocket>());
  const [statuses, setStatuses] = useState<Record<number, RecordingWebSocketStatus>>({});

  const disconnect = useCallback((recordingSessionId: number) => {
    const socket = sockets.current.get(recordingSessionId);
    if (socket) {
      sockets.current.delete(recordingSessionId);
      socket.onopen = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.close();
    }
    setStatuses((current) => ({ ...current, [recordingSessionId]: 'idle' }));
  }, []);

  const connect = useCallback((recordingSessionId: number, audioFormat: AudioFormat) => {
    if (sockets.current.has(recordingSessionId)) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      setStatuses((current) => ({ ...current, [recordingSessionId]: 'unconfigured' }));
      return;
    }

    let socket: WebSocket;
    try {
      const url = new URL(
        `/ws/v1/recordings/${encodeURIComponent(recordingSessionId)}/audio`,
        baseUrl,
      );
      if (url.protocol === 'http:') url.protocol = 'ws:';
      else if (url.protocol === 'https:') url.protocol = 'wss:';
      else throw new Error('지원하지 않는 WebSocket 주소입니다.');
      url.searchParams.set('audioFormat', audioFormat);

      // 브라우저가 전송 가능한 쿠키를 핸드셰이크에 자동으로 포함한다.
      socket = new WebSocket(url);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'recording-websocket', 'recording.session_id': recordingSessionId },
      });
      setStatuses((current) => ({ ...current, [recordingSessionId]: 'error' }));
      return;
    }

    sockets.current.set(recordingSessionId, socket);
    setStatuses((current) => ({ ...current, [recordingSessionId]: 'connecting' }));

    // 연결 자체가 실패했는지, 녹음 중에 끊겼는지 구분하기 위해 기록한다.
    let opened = false;

    socket.onopen = () => {
      if (sockets.current.get(recordingSessionId) !== socket) return;
      opened = true;
      setStatuses((current) => ({ ...current, [recordingSessionId]: 'connected' }));
    };

    socket.onerror = () => {
      if (sockets.current.get(recordingSessionId) !== socket) return;
      sockets.current.delete(recordingSessionId);
      socket.close();
      setStatuses((current) => ({ ...current, [recordingSessionId]: 'error' }));
      reportSocketFailure('녹음 WebSocket 오류', recordingSessionId, opened);
    };

    // 직접 끊을 때는 disconnect에서 핸들러를 먼저 해제하므로, 여기까지 오면 의도하지 않은 종료다.
    socket.onclose = (event) => {
      if (sockets.current.get(recordingSessionId) !== socket) return;
      sockets.current.delete(recordingSessionId);
      setStatuses((current) => ({ ...current, [recordingSessionId]: 'error' }));
      reportSocketFailure('녹음 WebSocket 연결 종료', recordingSessionId, opened, event);
    };
  }, []);

  const sendAudioChunk = useCallback((recordingSessionId: number, chunk: Blob) => {
    const socket = sockets.current.get(recordingSessionId);
    if (socket?.readyState === WebSocket.OPEN) socket.send(chunk);
  }, []);

  useEffect(() => {
    const activeSockets = sockets.current;
    return () => {
      activeSockets.forEach((socket) => {
        socket.onopen = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.close();
      });
      activeSockets.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ statuses, connect, sendAudioChunk, disconnect }),
    [statuses, connect, sendAudioChunk, disconnect],
  );

  return (
    <RecordingWebSocketContext.Provider value={value}>
      {children}
    </RecordingWebSocketContext.Provider>
  );
}

export function useRecordingWebSocket() {
  const context = useContext(RecordingWebSocketContext);
  if (!context) throw new Error('RecordingWebSocketProvider가 필요합니다.');
  return context;
}
