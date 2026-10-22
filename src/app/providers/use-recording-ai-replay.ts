'use client';

import { useEffect, useEffectEvent, useRef } from 'react';
import { getLastAppendedChunkSeq, readRecordingChunksForReplay } from '@/features/recording';
import { useRecordingWebSocket } from '@/features/recording-websocket';
import { captureException } from '@/shared/lib';
import { replayRecordingChunks } from './replay-recording-chunks';

export const useRecordingAiReplay = () => {
  const { addMessageListener, sendReplayedAudioChunk, resumeSending } = useRecordingWebSocket();
  const replayRunIds = useRef(new Map<number, number>());
  const replayingSessionIds = useRef(new Set<number>());

  const replay = useEffectEvent(async (recordingSessionId: number, fromSequence: number) => {
    const runId = (replayRunIds.current.get(recordingSessionId) ?? 0) + 1;
    replayRunIds.current.set(recordingSessionId, runId);
    const isCancelled = () => replayRunIds.current.get(recordingSessionId) !== runId;
    replayingSessionIds.current.add(recordingSessionId);

    try {
      const caughtUp = await replayRecordingChunks({
        recordingSessionId,
        fromSequence,
        readChunks: readRecordingChunksForReplay,
        getLastAppendedSeq: getLastAppendedChunkSeq,
        send: sendReplayedAudioChunk,
        isCancelled,
      });
      if (caughtUp) resumeSending(recordingSessionId);
    } catch (error) {
      captureException(error, {
        tags: { feature: 'recording-ai-replay', 'recording.session_id': recordingSessionId },
      });
      if (!isCancelled()) resumeSending(recordingSessionId);
    } finally {
      if (!isCancelled()) replayingSessionIds.current.delete(recordingSessionId);
    }
  });

  useEffect(
    () =>
      addMessageListener((recordingSessionId, message) => {
        if (message.type === 'recording.replay.request') {
          void replay(recordingSessionId, message.fromSequence);
        }
        if (
          message.type === 'recording.recovery.completed' &&
          !replayingSessionIds.current.has(recordingSessionId)
        ) {
          resumeSending(recordingSessionId);
        }
      }),
    [addMessageListener, resumeSending],
  );
};
