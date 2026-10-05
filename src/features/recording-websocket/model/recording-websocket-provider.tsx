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
import {
  CLOSE_CODE_COMPLETED,
  CLOSE_CODE_SUPERSEDED,
  createAudioFrame,
  createRecoveryFinishedMessage,
  isRecoveryMessage,
  parseSocketMessage,
  type RecordingSocketMessage,
  type RecoveryMessage,
  type RecoveryMessageType,
} from './recording-socket-protocol';
import { createRecoveryMessageInbox } from './recovery-message-inbox';
import { reportSocketFailure } from './report-socket-failure';

/** closed: 녹음 종료로 BE가 닫음, superseded: 다른 탭·기기의 새 연결로 대체됨. 둘 다 재연결하지 않는다. */
export type RecordingWebSocketStatus =
  'idle' | 'unconfigured' | 'connecting' | 'connected' | 'error' | 'closed' | 'superseded';

type RecordingSocketMessageListener = (
  recordingSessionId: number,
  message: RecordingSocketMessage,
) => void;

interface RecordingWebSocketContextValue {
  statuses: Record<number, RecordingWebSocketStatus>;
  connect: (recordingSessionId: number, audioFormat: AudioFormat) => void;
  sendAudioChunk: (recordingSessionId: number, chunk: Blob, seq: number) => void;
  sendRecoveryFinished: (recordingSessionId: number, lastSequence: number) => void;
  disconnect: (recordingSessionId: number) => void;
  addMessageListener: (listener: RecordingSocketMessageListener) => () => void;
  waitForRecoveryMessage: (
    recordingSessionId: number,
    types: RecoveryMessageType[],
    timeoutMs: number,
  ) => Promise<RecoveryMessage>;
}

const RecordingWebSocketContext = createContext<RecordingWebSocketContextValue | null>(null);

export function RecordingWebSocketProvider({ children }: { children: ReactNode }) {
  const sockets = useRef(new Map<number, WebSocket>());
  const messageListeners = useRef(new Set<RecordingSocketMessageListener>());
  const recoveryInbox = useRef(createRecoveryMessageInbox());
  const [statuses, setStatuses] = useState<Record<number, RecordingWebSocketStatus>>({});

  const waitForRecoveryMessage = useCallback(
    (recordingSessionId: number, types: RecoveryMessageType[], timeoutMs: number) =>
      sockets.current.has(recordingSessionId)
        ? recoveryInbox.current.wait(recordingSessionId, types, timeoutMs)
        : Promise.reject(new Error('녹음 WebSocket 연결이 없습니다.')),
    [],
  );

  const disconnect = useCallback((recordingSessionId: number) => {
    recoveryInbox.current.clear(recordingSessionId);
    const socket = sockets.current.get(recordingSessionId);
    if (socket) {
      sockets.current.delete(recordingSessionId);
      socket.onopen = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.onmessage = null;
      socket.close();
    }
    setStatuses((current) => ({ ...current, [recordingSessionId]: 'idle' }));
  }, []);

  const connect = useCallback((recordingSessionId: number, audioFormat: AudioFormat) => {
    if (sockets.current.has(recordingSessionId)) return;
    recoveryInbox.current.clear(recordingSessionId);

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

    socket.onmessage = (event: MessageEvent) => {
      if (sockets.current.get(recordingSessionId) !== socket) return;
      const message = parseSocketMessage(event.data);
      if (!message) return;
      messageListeners.current.forEach((listener) => listener(recordingSessionId, message));
      if (isRecoveryMessage(message)) recoveryInbox.current.deliver(recordingSessionId, message);
    };

    socket.onerror = () => {
      if (sockets.current.get(recordingSessionId) !== socket) return;
      sockets.current.delete(recordingSessionId);
      recoveryInbox.current.clear(recordingSessionId);
      socket.close();
      setStatuses((current) => ({ ...current, [recordingSessionId]: 'error' }));
      reportSocketFailure('녹음 WebSocket 오류', recordingSessionId, opened);
    };

    // 직접 끊을 때는 disconnect에서 핸들러를 먼저 해제하므로, 여기까지 오면 의도하지 않은 종료다.
    socket.onclose = (event) => {
      if (sockets.current.get(recordingSessionId) !== socket) return;
      sockets.current.delete(recordingSessionId);
      recoveryInbox.current.clear(recordingSessionId);

      if (event.code === CLOSE_CODE_COMPLETED || event.code === CLOSE_CODE_SUPERSEDED) {
        const status = event.code === CLOSE_CODE_COMPLETED ? 'closed' : 'superseded';
        setStatuses((current) => ({ ...current, [recordingSessionId]: status }));
        return;
      }

      setStatuses((current) => ({ ...current, [recordingSessionId]: 'error' }));
      reportSocketFailure('녹음 WebSocket 연결 종료', recordingSessionId, opened, event);
    };
  }, []);

  const sendAudioChunk = useCallback((recordingSessionId: number, chunk: Blob, seq: number) => {
    const socket = sockets.current.get(recordingSessionId);
    if (socket?.readyState === WebSocket.OPEN) socket.send(createAudioFrame(chunk, seq));
  }, []);

  const sendRecoveryFinished = useCallback((recordingSessionId: number, lastSequence: number) => {
    const socket = sockets.current.get(recordingSessionId);
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(createRecoveryFinishedMessage(lastSequence));
    }
  }, []);

  useEffect(() => {
    const activeSockets = sockets.current;
    return () => {
      activeSockets.forEach((socket) => {
        socket.onopen = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.onmessage = null;
        socket.close();
      });
      activeSockets.clear();
    };
  }, []);

  const addMessageListener = useCallback((listener: RecordingSocketMessageListener) => {
    messageListeners.current.add(listener);
    return () => {
      messageListeners.current.delete(listener);
    };
  }, []);

  const value = useMemo(
    () => ({
      statuses,
      connect,
      sendAudioChunk,
      sendRecoveryFinished,
      disconnect,
      addMessageListener,
      waitForRecoveryMessage,
    }),
    [
      statuses,
      connect,
      sendAudioChunk,
      sendRecoveryFinished,
      disconnect,
      addMessageListener,
      waitForRecoveryMessage,
    ],
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
