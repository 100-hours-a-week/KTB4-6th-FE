'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import {
  deleteStaleRecordingChunks,
  getNextRecordingChunkPosition,
  isIndexedDbSupported,
  markRecordingChunksAcked,
  putRecordingChunk,
} from './recording-chunk-db';
import { useMediaRecorder } from './useMediaRecorder';

/** 다음 chunk에 붙일 순번·녹음 객체 번호. 녹음 객체가 바뀔 때마다 새로 정한다. */
interface ChunkCursor {
  recordingSessionId: number;
  seq: number;
  partIndex: number;
}

let chunkCursor: ChunkCursor | null = null;
// 순번은 전송에도 쓰여서, 저장 대기열과 별도로 번호 결정만 기다릴 수 있게 나눠 둔다.
let pendingCursor: Promise<void> = Promise.resolve();
let pendingChunkWrite: Promise<void> = Promise.resolve();
let reportedFailureSessionId: number | null = null;

// 녹음은 90분이면 자동 종료되므로, 이보다 충분히 오래된 세션만 정리한다.
const STALE_CHUNK_AGE_MS = 3 * 60 * 60 * 1000;

// 저장이 한 번 실패하면 이후 chunk도 연달아 실패하기 쉬워서 세션당 한 번만 보고한다.
const reportChunkSaveFailure = (recordingSessionId: number, error: unknown) => {
  if (reportedFailureSessionId === recordingSessionId) return;
  reportedFailureSessionId = recordingSessionId;

  Sentry.captureException(error, {
    tags: {
      feature: 'recording-storage',
      'recording.session_id': recordingSessionId,
      ...(error instanceof DOMException && { 'storage.error': error.name }),
    },
  });
};

const startChunkPart = (recordingSessionId: number) => {
  pendingCursor = pendingCursor
    .then(async () => {
      if (chunkCursor?.recordingSessionId === recordingSessionId) {
        chunkCursor = { ...chunkCursor, partIndex: chunkCursor.partIndex + 1 };
        return;
      }
      const position = isIndexedDbSupported()
        ? await getNextRecordingChunkPosition(recordingSessionId)
        : { seq: 1, partIndex: 0 };
      chunkCursor = { recordingSessionId, ...position };
    })
    .catch((error: unknown) => {
      chunkCursor = null;
      reportChunkSaveFailure(recordingSessionId, error);
    });
};

/** 녹음을 시작하기 전에 순번이 정해졌는지 기다린다. 정하지 못했으면 false다. */
export const waitForChunkCursor = async (recordingSessionId: number) => {
  await pendingCursor;
  return chunkCursor?.recordingSessionId === recordingSessionId;
};

/** chunk에 순번을 붙여 같은 순번으로 전송하고 IndexedDB에 저장한다. */
export const appendRecordingChunk = (chunk: Blob, send: (seq: number) => void) => {
  const cursor = chunkCursor;
  if (!cursor) return;

  const seq = cursor.seq;
  cursor.seq += 1;
  send(seq);

  if (!isIndexedDbSupported()) return;
  const record = {
    recordingSessionId: cursor.recordingSessionId,
    seq,
    partIndex: cursor.partIndex,
    status: 'pending' as const,
    createdAt: Date.now(),
    data: chunk,
  };
  pendingChunkWrite = pendingChunkWrite.then(() =>
    putRecordingChunk(record).catch((error: unknown) => {
      reportChunkSaveFailure(record.recordingSessionId, error);
    }),
  );
};

/** BE가 받았다고 확인한 순번까지 수신 확인으로 표시한다. 해당 chunk가 저장된 뒤에 처리한다. */
export const acknowledgeRecordingChunks = (recordingSessionId: number, seq: number) => {
  if (!isIndexedDbSupported()) return;
  pendingChunkWrite = pendingChunkWrite.then(() =>
    markRecordingChunksAcked(recordingSessionId, seq).catch((error: unknown) => {
      reportChunkSaveFailure(recordingSessionId, error);
    }),
  );
};

/** 저장된 chunk를 읽기 전에 불러야 마지막 chunk까지 포함된다. */
export const flushRecordingChunks = () => Promise.all([pendingCursor, pendingChunkWrite]);

/** 녹음 객체가 바뀔 때마다 새 part로 순번을 정하고, chunk를 IndexedDB에 저장해둔다(로컬 백업). */
export const useRecordingChunkBuffer = (recordingSessionId: number | null) => {
  const recorder = useMediaRecorder((state) => state.recorder);

  useEffect(() => {
    if (!isIndexedDbSupported()) return;
    void deleteStaleRecordingChunks(STALE_CHUNK_AGE_MS).catch(() => {});
  }, []);

  useEffect(() => {
    if (recordingSessionId === null || recorder === null) return;
    startChunkPart(recordingSessionId);
  }, [recorder, recordingSessionId]);
};
