'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import {
  deleteStaleRecordingChunks,
  getNextRecordingChunkPosition,
  isIndexedDbSupported,
  putRecordingChunk,
} from './recording-chunk-db';
import { useMediaRecorder } from './useMediaRecorder';

/** IndexedDB에 다음으로 저장할 chunk의 위치. 녹음 객체가 바뀔 때마다 새로 정한다. */
interface ChunkCursor {
  recordingSessionId: number;
  seq: number;
  partIndex: number;
}

let chunkCursor: ChunkCursor | null = null;
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
  pendingChunkWrite = pendingChunkWrite
    .then(async () => {
      if (chunkCursor?.recordingSessionId === recordingSessionId) {
        chunkCursor = { ...chunkCursor, partIndex: chunkCursor.partIndex + 1 };
        return;
      }
      const position = await getNextRecordingChunkPosition(recordingSessionId);
      chunkCursor = { recordingSessionId, ...position };
    })
    .catch((error: unknown) => {
      // 위치를 못 정하면 이 녹음 객체의 chunk는 IndexedDB에 저장하지 않는다 — 실시간 전송에는 영향 없다.
      chunkCursor = null;
      reportChunkSaveFailure(recordingSessionId, error);
    });
};

export const appendRecordingChunk = (chunk: Blob) => {
  const createdAt = Date.now();

  pendingChunkWrite = pendingChunkWrite.then(async () => {
    const cursor = chunkCursor;
    if (!cursor) return;

    const seq = cursor.seq;
    cursor.seq += 1;
    try {
      await putRecordingChunk({
        recordingSessionId: cursor.recordingSessionId,
        seq,
        partIndex: cursor.partIndex,
        status: 'pending',
        createdAt,
        data: chunk,
      });
    } catch (error) {
      // 개별 chunk 저장 실패는 실시간 전송 경로에는 영향 없다.
      reportChunkSaveFailure(cursor.recordingSessionId, error);
    }
  });
};

/** 저장된 chunk를 읽기 전에 불러야 마지막 chunk까지 포함된다. */
export const flushRecordingChunks = () => pendingChunkWrite;

/** 녹음 객체가 바뀔 때마다 새 part로 chunk를 IndexedDB에 저장해둔다(로컬 백업). */
export const useRecordingChunkBuffer = (recordingSessionId: number | null) => {
  const recorder = useMediaRecorder((state) => state.recorder);

  useEffect(() => {
    if (!isIndexedDbSupported()) return;
    void deleteStaleRecordingChunks(STALE_CHUNK_AGE_MS).catch(() => {});
  }, []);

  useEffect(() => {
    if (recordingSessionId === null || recorder === null || !isIndexedDbSupported()) return;
    startChunkPart(recordingSessionId);
  }, [recorder, recordingSessionId]);
};
