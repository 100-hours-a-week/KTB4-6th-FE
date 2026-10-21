'use client';

import { useEffect } from 'react';
import { captureException } from '@/shared/lib';
import { encodeRecordingChunk, recoverRecordingEncoding } from './aac-encoder';
import { countPcmSamples } from './pcm-capture';
import {
  deleteStaleRecordingChunks,
  getNextRecordingChunkPosition,
  getPendingRecordingChunks,
  isIndexedDbSupported,
  markRecordingChunksAcked,
  putRecordingChunk,
} from './recording-chunk-db';

interface ChunkCursor {
  recordingSessionId: number;
  seq: number;
  startSample: number;
}

let chunkCursor: ChunkCursor | null = null;
let pendingCursor: Promise<void> = Promise.resolve();
let pendingChunkWrite: Promise<void> = Promise.resolve();
let reportedFailureSessionId: number | null = null;

const STALE_CHUNK_AGE_MS = 3 * 60 * 60 * 1000;

const reportChunkSaveFailure = (recordingSessionId: number, error: unknown) => {
  if (reportedFailureSessionId === recordingSessionId) return;
  reportedFailureSessionId = recordingSessionId;

  captureException(error, {
    tags: {
      feature: 'recording-storage',
      'recording.session_id': recordingSessionId,
      ...(error instanceof DOMException && { 'storage.error': error.name }),
    },
  });
};

export const prepareChunkCursor = (recordingSessionId: number, lastProcessedSequence: number) => {
  pendingCursor = pendingCursor.then(async () => {
    const minSeq = lastProcessedSequence + 1;
    if (chunkCursor?.recordingSessionId === recordingSessionId) {
      chunkCursor = {
        recordingSessionId,
        seq: Math.max(chunkCursor.seq, minSeq),
        startSample: chunkCursor.startSample,
      };
      return;
    }

    try {
      const position = isIndexedDbSupported()
        ? await getNextRecordingChunkPosition(recordingSessionId)
        : { seq: 1, startSample: 0 };
      chunkCursor = {
        recordingSessionId,
        seq: Math.max(position.seq, minSeq),
        startSample: position.startSample,
      };
      if (isIndexedDbSupported()) void recoverRecordingEncoding(recordingSessionId);
    } catch (error) {
      chunkCursor = { recordingSessionId, seq: minSeq, startSample: 0 };
      reportChunkSaveFailure(recordingSessionId, error);
    }
  });
  return pendingCursor;
};

export const getRecordingChunksToResend = async (
  recordingSessionId: number,
  lastProcessedSequence: number,
) => {
  if (!isIndexedDbSupported()) return [];
  await pendingChunkWrite;
  try {
    await markRecordingChunksAcked(recordingSessionId, lastProcessedSequence);
    return await getPendingRecordingChunks(recordingSessionId);
  } catch (error) {
    reportChunkSaveFailure(recordingSessionId, error);
    return [];
  }
};

export const appendRecordingChunk = (chunk: ArrayBuffer, send: (seq: number) => void) => {
  const cursor = chunkCursor;
  if (!cursor) return;

  const { seq, startSample } = cursor;
  cursor.seq += 1;
  cursor.startSample += countPcmSamples(chunk);
  send(seq);

  if (!isIndexedDbSupported()) return;
  const record = {
    recordingSessionId: cursor.recordingSessionId,
    seq,
    startSample,
    status: 'pending' as const,
    createdAt: Date.now(),
    data: chunk,
  };
  pendingChunkWrite = pendingChunkWrite.then(() =>
    putRecordingChunk(record).catch((error: unknown) => {
      reportChunkSaveFailure(record.recordingSessionId, error);
    }),
  );
  encodeRecordingChunk(record.recordingSessionId, chunk, startSample);
};

export const acknowledgeRecordingChunks = (recordingSessionId: number, seq: number) => {
  if (!isIndexedDbSupported()) return;
  pendingChunkWrite = pendingChunkWrite.then(() =>
    markRecordingChunksAcked(recordingSessionId, seq).catch((error: unknown) => {
      reportChunkSaveFailure(recordingSessionId, error);
    }),
  );
};

export const flushRecordingChunks = () => Promise.all([pendingCursor, pendingChunkWrite]);

export const useRecordingChunkBuffer = () => {
  useEffect(() => {
    if (!isIndexedDbSupported()) return;
    void deleteStaleRecordingChunks(STALE_CHUNK_AGE_MS).catch(() => {});
  }, []);
};
