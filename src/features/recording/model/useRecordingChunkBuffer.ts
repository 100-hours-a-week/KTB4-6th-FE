'use client';

import { useEffect } from 'react';
import { isOpfsSupported, openOpfsFileForWriting } from '@/shared/lib';
import { findLatestOpfsPartIndex, partFileName } from './opfs-recording-parts';
import {
  getNextRecordingChunkPosition,
  isIndexedDbSupported,
  putRecordingChunk,
} from './recording-chunk-db';
import { useMediaRecorder } from './useMediaRecorder';

// recordedChunks(useMediaRecorder.ts)와 같은 이유로 모듈 레벨 상태로 둔다 — 이 훅은
// RecordingSessionManager 하나에서만 호출되지만, 회의 종료 흐름(useCompleteRecordingFlow)처럼
// 완전히 다른 위치에서도 "지금 쓰던 걸 다 끝내고 나서" 접근할 수 있어야 해서다.
let currentWritable: FileSystemWritableFileStream | null = null;
let pendingWrite: Promise<void> = Promise.resolve();
let currentSessionId: number | null = null;
let currentPartIndex = 0;

/** IndexedDB에 다음으로 저장할 chunk의 위치. 녹음 객체가 바뀔 때마다 새로 정한다. */
interface ChunkCursor {
  recordingSessionId: number;
  seq: number;
  partIndex: number;
}

let chunkCursor: ChunkCursor | null = null;
let pendingChunkWrite: Promise<void> = Promise.resolve();

/**
 * 새 녹음 객체의 chunk를 저장할 위치를 정한다.
 * 이 페이지에서 처음 다루는 세션이면(새로 시작했거나 새로고침 후 재진입) DB의 마지막 chunk 다음부터,
 * 같은 세션에서 녹음 객체만 바뀐 거면 순번은 이어가고 녹음 객체 번호만 올린다.
 */
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

const appendChunkToIndexedDb = (chunk: Blob) => {
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

/**
 * chunk를 로컬에 순서대로 저장한다. 지금 열려있는 OPFS part 파일에 이어쓰고, IndexedDB에도 저장한다.
 * 저장할 곳이 없으면 조용히 무시한다.
 */
export const appendRecordingChunk = (chunk: Blob) => {
  appendChunkToIndexedDb(chunk);

  const writable = currentWritable;
  if (!writable) return;

  pendingWrite = pendingWrite
    .then(() => writable.write(chunk))
    .catch(() => {
      // 개별 chunk 쓰기 실패는 무시한다 — 실시간 전송 경로에는 영향 없다.
    });
};

/**
 * 지금 열려있는 OPFS part 파일에 예약된 쓰기를 전부 끝내고 닫는다.
 *
 * OPFS는 close()해야 실제 파일로 커밋된다 — 그 전까지는 브라우저 내부 스왑 파일
 * 상태라 디렉터리 목록에도 안 잡히고 읽을 수도 없다. 그래서 회의를 끝내는 흐름에서
 * part 파일들을 읽어가기 전에 반드시 이걸 먼저 불러야 지금 쓰던 part까지 포함된다.
 *
 * 부르고 나면 이 part는 더 이상 이어쓸 수 없다 — recorder가 바뀌어야 새 part가
 * 열리므로, 녹음을 계속 이어갈 생각이면 부르면 안 되고 회의를 끝낼 때만 쓴다.
 */
export const flushRecordingChunks = () => {
  const writable = currentWritable;
  currentWritable = null;
  if (writable) {
    pendingWrite = pendingWrite
      .then(() => writable.close())
      .catch(() => {
        // close에 실패해도 이후 읽기 시도에서 실패로 드러난다.
      });
  }

  // IndexedDB는 chunk마다 바로 확정되므로 닫을 건 없고, 예약된 저장이 끝나기만 기다린다.
  return Promise.all([pendingWrite, pendingChunkWrite]).then(() => {});
};

/**
 * recordingSessionId가 있는 동안, 실시간 전송과 별개로 chunk를 OPFS와 IndexedDB에도 저장해둔다.
 * 녹음 객체가 소실돼도(새로고침 등) 그동안 쌓인 chunk를 잃지 않기 위한 로컬 백업이다.
 * IndexedDB에는 chunk 단위로 순번·녹음 객체 번호와 함께 저장한다.
 *
 * MediaRecorder 인스턴스가 바뀔 때마다(일시정지 중 연결 소실 후 재생성 등) 새 part 파일로 넘어간다.
 * 같은 인스턴스의 일시정지·재개는 recorder 참조가 그대로라 새 part를 만들지 않는다.
 *
 * 이 세션을 처음 다루는 순간(녹음을 새로 시작했거나, 새로고침 후 재진입해 같은
 * recordingSessionId를 다시 만난 순간) OPFS에 이미 있는 part 파일 중 가장 큰 번호를 조회해
 * 그다음 번호부터 이어서 매긴다 — 그래야 새로고침 전에 쓰던 part 파일을 덮어쓰지 않는다.
 *
 * OPFS·IndexedDB 미지원 브라우저거나 저장소를 못 열어도, 실시간 전송 경로에는 영향을 주지 않고 조용히 넘어간다.
 */
export const useRecordingChunkBuffer = (recordingSessionId: number | null) => {
  const recorder = useMediaRecorder((state) => state.recorder);

  useEffect(() => {
    if (recordingSessionId === null || recorder === null) return;
    if (isIndexedDbSupported()) startChunkPart(recordingSessionId);
    if (!isOpfsSupported()) return;

    let cancelled = false;

    void (async () => {
      if (currentSessionId !== recordingSessionId) {
        try {
          currentPartIndex = await findLatestOpfsPartIndex(recordingSessionId);
        } catch {
          currentPartIndex = 0;
        }
        currentSessionId = recordingSessionId;
      }

      if (cancelled) return;

      currentPartIndex += 1;
      const partName = partFileName(recordingSessionId, currentPartIndex);

      try {
        const writable = await openOpfsFileForWriting(partName);

        if (cancelled) {
          await writable.close();
          return;
        }

        currentWritable = writable;
      } catch {
        // OPFS를 못 열어도 실시간 전송은 그대로 진행되니 조용히 넘어간다.
      }
    })();

    return () => {
      cancelled = true;
      flushRecordingChunks();
    };
  }, [recorder, recordingSessionId]);
};
