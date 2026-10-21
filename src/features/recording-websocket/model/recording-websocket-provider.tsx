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
import { captureException } from '@/shared/lib';
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

const SEND_BUFFER_POLL_INTERVAL_MS = 50;

export type RecordingWebSocketStatus =
  | 'idle'
  | 'unconfigured'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'closed'
  | 'superseded'
  | 'failed';

type RecordingSocketMessageListener = (
  recordingSessionId: number,
  message: RecordingSocketMessage,
) => void;

interface RecordingWebSocketContextValue {
  statuses: Record<number, RecordingWebSocketStatus>;
  connect: (recordingSessionId: number, audioFormat: AudioFormat) => void;
  sendAudioChunk: (recordingSessionId: number, chunk: ArrayBuffer, seq: number) => void;
  sendRecoveryFinished: (recordingSessionId: number, lastSequence: number) => void;
  waitForAudioSent: (recordingSessionId: number, timeoutMs: number) => Promise<void>;
  disconnect: (recordingSessionId: number) => void;
  isEndedByServer: (recordingSessionId: number) => boolean;
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
  const failedSessionIds = useRef(new Set<number>());
  const [statuses, setStatuses] = useState<Record<number, RecordingWebSocketStatus>>({});

  const waitForRecoveryMessage = useCallback(
    (recordingSessionId: number, types: RecoveryMessageType[], timeoutMs: number) =>
      sockets.current.has(recordingSessionId)
        ? recoveryInbox.current.wait(recordingSessionId, types, timeoutMs)
        : Promise.reject(new Error('녹음 WebSocket 연결이 없습니다.')),
    [],
  );

  const closeSocket = useCallback((recordingSessionId: number) => {
    recoveryInbox.current.clear(recordingSessionId);
    const socket = sockets.current.get(recordingSessionId);
    if (!socket) return;
    sockets.current.delete(recordingSessionId);
    socket.onopen = null;
    socket.onerror = null;
    socket.onclose = null;
    socket.onmessage = null;
    socket.close();
  }, []);

  const isEndedByServer = useCallback(
    (recordingSessionId: number) => failedSessionIds.current.has(recordingSessionId),
    [],
  );

  const disconnect = useCallback(
    (recordingSessionId: number) => {
      closeSocket(recordingSessionId);
      const status = failedSessionIds.current.has(recordingSessionId) ? 'failed' : 'idle';
      setStatuses((current) => ({ ...current, [recordingSessionId]: status }));
    },
    [closeSocket],
  );

  const connect = useCallback(
    (recordingSessionId: number, audioFormat: AudioFormat) => {
      if (sockets.current.has(recordingSessionId)) return;
      if (failedSessionIds.current.has(recordingSessionId)) return;
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
        captureException(error, {
          tags: { feature: 'recording-websocket', 'recording.session_id': recordingSessionId },
        });
        setStatuses((current) => ({ ...current, [recordingSessionId]: 'error' }));
        return;
      }

      sockets.current.set(recordingSessionId, socket);
      setStatuses((current) => ({ ...current, [recordingSessionId]: 'connecting' }));

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
        if (message.type === 'recording.error') {
          failedSessionIds.current.add(recordingSessionId);
          closeSocket(recordingSessionId);
          setStatuses((current) => ({ ...current, [recordingSessionId]: 'failed' }));
        }
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
    },
    [closeSocket],
  );

  const sendAudioChunk = useCallback(
    (recordingSessionId: number, chunk: ArrayBuffer, seq: number) => {
      const socket = sockets.current.get(recordingSessionId);
      if (socket?.readyState === WebSocket.OPEN) socket.send(createAudioFrame(chunk, seq));
    },
    [],
  );

  const sendRecoveryFinished = useCallback((recordingSessionId: number, lastSequence: number) => {
    const socket = sockets.current.get(recordingSessionId);
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(createRecoveryFinishedMessage(lastSequence));
    }
  }, []);

  const waitForAudioSent = useCallback(
    (recordingSessionId: number, timeoutMs: number) =>
      new Promise<void>((resolve) => {
        const deadline = Date.now() + timeoutMs;
        const check = () => {
          const socket = sockets.current.get(recordingSessionId);
          if (
            socket?.readyState !== WebSocket.OPEN ||
            socket.bufferedAmount === 0 ||
            Date.now() >= deadline
          ) {
            resolve();
            return;
          }
          window.setTimeout(check, SEND_BUFFER_POLL_INTERVAL_MS);
        };
        check();
      }),
    [],
  );

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
      waitForAudioSent,
      disconnect,
      isEndedByServer,
      addMessageListener,
      waitForRecoveryMessage,
    }),
    [
      statuses,
      connect,
      sendAudioChunk,
      sendRecoveryFinished,
      waitForAudioSent,
      disconnect,
      isEndedByServer,
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
