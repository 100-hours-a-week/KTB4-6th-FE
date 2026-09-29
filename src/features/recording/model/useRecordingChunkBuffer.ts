'use client';

import { useCallback, useEffect, useRef } from 'react';
import { isOpfsSupported, openOpfsFileForWriting } from '@/shared/lib';

/**
 * recordingSessionId가 있는 동안, 실시간 전송과 별개로 chunk를 OPFS에도 이어서 저장해둔다.
 * 녹음 객체가 소실돼도(새로고침 등) 그동안 쌓인 chunk를 잃지 않기 위한 로컬 백업이다.
 * OPFS 미지원 브라우저거나 파일을 못 열어도, 실시간 전송 경로에는 영향을 주지 않고 조용히 넘어간다.
 */
export const useRecordingChunkBuffer = (recordingSessionId: number | null) => {
  const writableRef = useRef<FileSystemWritableFileStream | null>(null);

  useEffect(() => {
    writableRef.current = null;

    if (recordingSessionId === null || !isOpfsSupported()) return;

    let cancelled = false;

    void (async () => {
      try {
        const writable = await openOpfsFileForWriting(`recording-${recordingSessionId}.part`);

        if (cancelled) {
          await writable.close();
          return;
        }

        writableRef.current = writable;
      } catch {
        // OPFS를 못 열어도 실시간 전송은 그대로 진행되니 조용히 넘어간다.
      }
    })();

    return () => {
      cancelled = true;
      const writable = writableRef.current;
      writableRef.current = null;
      void writable?.close();
    };
  }, [recordingSessionId]);

  // effect 의존성 배열에 안전하게 넣을 수 있도록 참조를 고정한다.
  const appendChunk = useCallback((chunk: Blob) => {
    void writableRef.current?.write(chunk).catch(() => {
      // 개별 chunk 쓰기 실패는 무시한다 — 실시간 전송 경로에는 영향 없다.
    });
  }, []);

  return { appendChunk };
};
