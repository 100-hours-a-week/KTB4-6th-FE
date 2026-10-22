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
import { createRecordingSessionFlags } from './recording-session-flags';
import {
  closeSocketQuietly,
  createRecordingSocketUrl,
  sendAudioFrame,
  sendRecoveryFinishedMessage,
  waitForSendBufferDrained,
} from './recording-socket';
import {
  CLOSE_CODE_COMPLETED,
  CLOSE_CODE_SUPERSEDED,
  isRecoveryMessage,
  parseSocketMessage,
  type RecordingSocketMessage,
  type RecoveryMessage,
  type RecoveryMessageType,
} from './recording-socket-protocol';
import { createRecoveryMessageInbox } from './recovery-message-inbox';
import { reportSocketFailure } from './report-socket-failure';

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
  sendReplayedAudioChunk: (recordingSessionId: number, chunk: ArrayBuffer, seq: number) => void;
  resumeSending: (recordingSessionId: number) => void;
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
  const sessionFlags = useRef(createRecordingSessionFlags());
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
    sessionFlags.current.resetAiRecovery(recordingSessionId);
    const socket = sockets.current.get(recordingSessionId);
    if (!socket) return;
    sockets.current.delete(recordingSessionId);
    closeSocketQuietly(socket);
  }, []);

  const isEndedByServer = useCallback(
    (recordingSessionId: number) => sessionFlags.current.isEndedByServer(recordingSessionId),
    [],
  );

  const disconnect = useCallback(
    (recordingSessionId: number) => {
      closeSocket(recordingSessionId);
      const status = sessionFlags.current.isEndedByServer(recordingSessionId) ? 'failed' : 'idle';
      setStatuses((current) => ({ ...current, [recordingSessionId]: status }));
    },
    [closeSocket],
  );

  const connect = useCallback(
    (recordingSessionId: number, audioFormat: AudioFormat) => {
      if (sockets.current.has(recordingSessionId)) return;
      if (sessionFlags.current.isEndedByServer(recordingSessionId)) return;
      recoveryInbox.current.clear(recordingSessionId);
      sessionFlags.current.resetAiRecovery(recordingSessionId);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) {
        setStatuses((current) => ({ ...current, [recordingSessionId]: 'unconfigured' }));
        return;
      }

      let socket: WebSocket;
      try {
        socket = new WebSocket(createRecordingSocketUrl(baseUrl, recordingSessionId, audioFormat));
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
        sessionFlags.current.applyMessage(recordingSessionId, message);
        if (message.type === 'recording.error') {
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
        sessionFlags.current.resetAiRecovery(recordingSessionId);
        socket.close();
        setStatuses((current) => ({ ...current, [recordingSessionId]: 'error' }));
        reportSocketFailure('녹음 WebSocket 오류', recordingSessionId, opened);
      };

      socket.onclose = (event) => {
        if (sockets.current.get(recordingSessionId) !== socket) return;
        sockets.current.delete(recordingSessionId);
        recoveryInbox.current.clear(recordingSessionId);
        sessionFlags.current.resetAiRecovery(recordingSessionId);

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
      if (sessionFlags.current.isSendPaused(recordingSessionId)) return;
      sendAudioFrame(sockets.current.get(recordingSessionId), chunk, seq);
    },
    [],
  );

  const sendReplayedAudioChunk = useCallback(
    (recordingSessionId: number, chunk: ArrayBuffer, seq: number) => {
      sendAudioFrame(sockets.current.get(recordingSessionId), chunk, seq);
    },
    [],
  );

  const resumeSending = useCallback((recordingSessionId: number) => {
    sessionFlags.current.resumeSending(recordingSessionId);
  }, []);

  const sendRecoveryFinished = useCallback((recordingSessionId: number, lastSequence: number) => {
    sendRecoveryFinishedMessage(sockets.current.get(recordingSessionId), lastSequence);
  }, []);

  const waitForAudioSent = useCallback(
    (recordingSessionId: number, timeoutMs: number) =>
      waitForSendBufferDrained(() => sockets.current.get(recordingSessionId), timeoutMs),
    [],
  );

  useEffect(() => {
    const activeSockets = sockets.current;
    return () => {
      activeSockets.forEach(closeSocketQuietly);
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
      sendReplayedAudioChunk,
      resumeSending,
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
      sendReplayedAudioChunk,
      resumeSending,
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
