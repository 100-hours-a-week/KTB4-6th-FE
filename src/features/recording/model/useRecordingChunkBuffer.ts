'use client';

import { useEffect } from 'react';
import {
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
    .catch(() => {
      // 위치를 못 정하면 이 녹음 객체의 chunk는 IndexedDB에 저장하지 않는다 — 실시간 전송에는 영향 없다.
      chunkCursor = null;
    });
};

export const appendRecordingChunk = (chunk: Blob) => {
  const createdAt = Date.now();

  pendingChunkWrite = pendingChunkWrite
    .then(async () => {
      const cursor = chunkCursor;
      if (!cursor) return;

      const seq = cursor.seq;
      cursor.seq += 1;
      await putRecordingChunk({
        recordingSessionId: cursor.recordingSessionId,
        seq,
        partIndex: cursor.partIndex,
        status: 'pending',
        createdAt,
        data: chunk,
      });
    })
    .catch(() => {
      // 개별 chunk 저장 실패는 무시한다 — 실시간 전송 경로에는 영향 없다.
    });
};

/** 저장된 chunk를 읽기 전에 불러야 마지막 chunk까지 포함된다. */
export const flushRecordingChunks = () => pendingChunkWrite;

/** 녹음 객체가 바뀔 때마다 새 part로 chunk를 IndexedDB에 저장해둔다(로컬 백업). */
export const useRecordingChunkBuffer = (recordingSessionId: number | null) => {
  const recorder = useMediaRecorder((state) => state.recorder);

  useEffect(() => {
    if (recordingSessionId === null || recorder === null || !isIndexedDbSupported()) return;
    startChunkPart(recordingSessionId);
  }, [recorder, recordingSessionId]);
};
