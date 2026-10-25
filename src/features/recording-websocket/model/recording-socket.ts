import type { AudioFormat } from '@/entities/recording';
import { createAudioFrame, createRecoveryFinishedMessage } from './recording-socket-protocol';

const SEND_BUFFER_POLL_INTERVAL_MS = 50;

const isOpen = (socket: WebSocket | undefined): socket is WebSocket =>
  socket?.readyState === WebSocket.OPEN;

export const createRecordingSocketUrl = (
  baseUrl: string,
  recordingSessionId: number,
  audioFormat: AudioFormat,
) => {
  const url = new URL(`/ws/v1/recordings/${encodeURIComponent(recordingSessionId)}/audio`, baseUrl);
  if (url.protocol === 'http:') url.protocol = 'ws:';
  else if (url.protocol === 'https:') url.protocol = 'wss:';
  else throw new Error('지원하지 않는 WebSocket 주소입니다.');
  url.searchParams.set('audioFormat', audioFormat);
  return url;
};

export const closeSocketQuietly = (socket: WebSocket) => {
  socket.onopen = null;
  socket.onerror = null;
  socket.onclose = null;
  socket.onmessage = null;
  socket.close();
};

export const sendAudioFrame = (socket: WebSocket | undefined, chunk: ArrayBuffer, seq: number) => {
  if (isOpen(socket)) socket.send(createAudioFrame(chunk, seq));
};

export const sendRecoveryFinishedMessage = (
  socket: WebSocket | undefined,
  lastSequence: number,
) => {
  if (isOpen(socket)) socket.send(createRecoveryFinishedMessage(lastSequence));
};

export const waitForSendBufferDrained = (
  getSocket: () => WebSocket | undefined,
  timeoutMs: number,
) =>
  new Promise<void>((resolve) => {
    const deadline = Date.now() + timeoutMs;
    const check = () => {
      const socket = getSocket();
      if (!isOpen(socket) || socket.bufferedAmount === 0 || Date.now() >= deadline) {
        resolve();
        return;
      }
      window.setTimeout(check, SEND_BUFFER_POLL_INTERVAL_MS);
    };
    check();
  });
