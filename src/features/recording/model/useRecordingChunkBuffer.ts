'use client';

import { useEffect } from 'react';
import { isOpfsSupported, openOpfsFileForWriting } from '@/shared/lib';
import { findLatestOpfsPartIndex, partFileName } from './opfs-recording-parts';
import { useMediaRecorder } from './useMediaRecorder';

// recordedChunks(useMediaRecorder.ts)와 같은 이유로 모듈 레벨 상태로 둔다 — 이 훅은
// RecordingSessionManager 하나에서만 호출되지만, 회의 종료 흐름(useCompleteRecordingFlow)처럼
// 완전히 다른 위치에서도 "지금 쓰던 걸 다 끝내고 나서" 접근할 수 있어야 해서다.
let currentWritable: FileSystemWritableFileStream | null = null;
let pendingWrite: Promise<void> = Promise.resolve();
let currentSessionId: number | null = null;
let currentPartIndex = 0;

/** 지금 열려있는 OPFS part 파일에 chunk를 순서대로 이어쓴다. 파일이 없으면 조용히 무시한다. */
export const appendRecordingChunk = (chunk: Blob) => {
  const writable = currentWritable;
  if (!writable) return;

  pendingWrite = pendingWrite
    .then(() => writable.write(chunk))
    .catch(() => {
      // 개별 chunk 쓰기 실패는 무시한다 — 실시간 전송 경로에는 영향 없다.
    });
};

/**
 * 지금까지 예약된 OPFS 쓰기가 전부 끝날 때까지 기다린다.
 * 회의 종료 직전 마지막 chunk까지 파일에 반영됐는지 확인하고 나서 읽어가려는 용도.
 */
export const flushRecordingChunks = () => pendingWrite;

const closeCurrentPart = () => {
  const writable = currentWritable;
  currentWritable = null;
  if (!writable) return;
  pendingWrite = pendingWrite.then(() => writable.close()).catch(() => {});
};

/**
 * recordingSessionId가 있는 동안, 실시간 전송과 별개로 chunk를 OPFS에도 이어서 저장해둔다.
 * 녹음 객체가 소실돼도(새로고침 등) 그동안 쌓인 chunk를 잃지 않기 위한 로컬 백업이다.
 *
 * MediaRecorder 인스턴스가 바뀔 때마다(일시정지 중 연결 소실 후 재생성 등) 새 part 파일로 넘어간다.
 * 같은 인스턴스의 일시정지·재개는 recorder 참조가 그대로라 새 part를 만들지 않는다.
 *
 * 이 세션을 처음 다루는 순간(녹음을 새로 시작했거나, 새로고침 후 재진입해 같은
 * recordingSessionId를 다시 만난 순간) OPFS에 이미 있는 part 파일 중 가장 큰 번호를 조회해
 * 그다음 번호부터 이어서 매긴다 — 그래야 새로고침 전에 쓰던 part 파일을 덮어쓰지 않는다.
 *
 * OPFS 미지원 브라우저거나 파일을 못 열어도, 실시간 전송 경로에는 영향을 주지 않고 조용히 넘어간다.
 */
export const useRecordingChunkBuffer = (recordingSessionId: number | null) => {
  const recorder = useMediaRecorder((state) => state.recorder);

  useEffect(() => {
    if (recordingSessionId === null || recorder === null || !isOpfsSupported()) return;

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
      closeCurrentPart();
    };
  }, [recorder, recordingSessionId]);
};
