'use client';

import { useEffect, useEffectEvent, useRef } from 'react';
import { captureException } from '@/shared/lib';
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
  const operation = useRecordingSessionStore((state) => state.operation);
  const { showToast } = useAppToast();
  const runId = useRef(0);
  const isStarting = useRef(false);

  const handleStarted = useEffectEvent(onStarted);
  const handleFailed = useEffectEvent((id: number, error: unknown) => {
    captureException(error, {
      tags: { feature: 'recording-recovery', 'recording.session_id': id },
    });
    disconnect(id);
    releaseMicrophone();
    showToast('브라우저 녹음을 시작하지 못했습니다.', 'danger');
  });

  useEffect(() => {
    if (recordingSessionId === undefined) return;
    if (socketStatus !== 'connected' || operation === 'finishing') {
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
    operation,
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
