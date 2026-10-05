'use client';

import { useEffect, useEffectEvent, useRef } from 'react';
import * as Sentry from '@sentry/nextjs';
import {
  appendRecordingChunk,
  getRecordingChunksToResend,
  prepareChunkCursor,
  useMediaRecorder,
  useRecordingSessionStore,
} from '@/features/recording';
import {
  useRecordingWebSocket,
  type RecordingWebSocketStatus,
} from '@/features/recording-websocket';
import { useAppToast } from '@/shared/ui';
import { recoverRecordingStream } from './recover-recording-stream';

interface UseRecordingStreamStartParams {
  recordingSessionId: number | undefined;
  socketStatus: RecordingWebSocketStatus | undefined;
  onStarted: () => void;
}

/**
 * 소켓이 연결되고 녹음 객체가 준비되면 복구 절차를 거쳐 녹음을 시작한다.
 * 실패하면 소켓·녹음 객체를 정리해서 재시도 흐름(useRecordingConnectionRecovery)으로 넘긴다.
 */
export const useRecordingStreamStart = ({
  recordingSessionId,
  socketStatus,
  onStarted,
}: UseRecordingStreamStartParams) => {
  const recorderStatus = useMediaRecorder((state) => state.status);
  const startBrowserRecording = useMediaRecorder((state) => state.start);
  const releaseMicrophone = useMediaRecorder((state) => state.release);
  const { sendAudioChunk, sendRecoveryFinished, disconnect, waitForRecoveryMessage } =
    useRecordingWebSocket();
  const setIsResumingStream = useRecordingSessionStore((state) => state.setIsResumingStream);
  const { showToast } = useAppToast();
  // 연결 하나에 복구가 한 번만 돌도록 막고, 연결이 바뀌면 진행 중이던 복구 결과는 버린다.
  const runId = useRef(0);
  const isStarting = useRef(false);

  const handleStarted = useEffectEvent(onStarted);
  // 소켓이 끊겨 실패한 경우는 연결 실패로 이미 보고돼서, 연결이 살아 있는 채 실패한 경우만 여기로 온다.
  const handleFailed = useEffectEvent((id: number, error: unknown) => {
    Sentry.captureException(error, {
      tags: { feature: 'recording-recovery', 'recording.session_id': id },
    });
    disconnect(id);
    releaseMicrophone();
    showToast('브라우저 녹음을 시작하지 못했습니다.', 'danger');
  });

  useEffect(() => {
    if (recordingSessionId === undefined) return;
    if (socketStatus !== 'connected') {
      runId.current += 1;
      isStarting.current = false;
      return;
    }
    if (recorderStatus !== 'ready' || isStarting.current) return;

    isStarting.current = true;
    const currentRunId = ++runId.current;

    void (async () => {
      try {
        const lastProcessedSequence = await recoverRecordingStream({
          recordingSessionId,
          waitForRecoveryMessage,
          getChunksToResend: getRecordingChunksToResend,
          sendAudioChunk,
          sendRecoveryFinished,
          onResuming: () => setIsResumingStream(true),
        });
        await prepareChunkCursor(recordingSessionId, lastProcessedSequence);
        if (currentRunId !== runId.current) return;

        startBrowserRecording((chunk) => {
          appendRecordingChunk(chunk, (seq) => sendAudioChunk(recordingSessionId, chunk, seq));
        });
        handleStarted();
      } catch (error) {
        if (currentRunId === runId.current) handleFailed(recordingSessionId, error);
      } finally {
        setIsResumingStream(false);
        if (currentRunId === runId.current) isStarting.current = false;
      }
    })();
  }, [
    recorderStatus,
    recordingSessionId,
    sendAudioChunk,
    sendRecoveryFinished,
    setIsResumingStream,
    socketStatus,
    startBrowserRecording,
    waitForRecoveryMessage,
  ]);
};
