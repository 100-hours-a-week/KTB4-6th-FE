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
import type { AudioFormat } from '@/entities/recording';

export type RecordingWebSocketStatus =
  'idle' | 'unconfigured' | 'connecting' | 'connected' | 'error';

interface RecordingWebSocketContextValue {
  statuses: Record<number, RecordingWebSocketStatus>;
  connect: (recordingSessionId: number, audioFormat: AudioFormat) => void;
  disconnect: (recordingSessionId: number) => void;
}

const RecordingWebSocketContext = createContext<RecordingWebSocketContextValue | null>(null);

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
    } catch {
      setStatuses((current) => ({ ...current, [recordingSessionId]: 'error' }));
      return;
    }

    sockets.current.set(recordingSessionId, socket);
    setStatuses((current) => ({ ...current, [recordingSessionId]: 'connecting' }));

    socket.onopen = () => {
      if (sockets.current.get(recordingSessionId) !== socket) return;
      setStatuses((current) => ({ ...current, [recordingSessionId]: 'connected' }));
    };

    socket.onerror = () => {
      if (sockets.current.get(recordingSessionId) !== socket) return;
      sockets.current.delete(recordingSessionId);
      socket.close();
      setStatuses((current) => ({ ...current, [recordingSessionId]: 'error' }));
    };

    socket.onclose = (event) => {
      if (sockets.current.get(recordingSessionId) !== socket) return;
      sockets.current.delete(recordingSessionId);
      setStatuses((current) => ({
        ...current,
        [recordingSessionId]: event.code === 1000 ? 'idle' : 'error',
      }));
    };
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

  const value = useMemo(() => ({ statuses, connect, disconnect }), [statuses, connect, disconnect]);

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
