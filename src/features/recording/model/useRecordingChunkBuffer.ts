'use client';

import { useCallback, useEffect, useRef } from 'react';
import { isOpfsSupported, openOpfsFileForWriting } from '@/shared/lib';
import { findLatestOpfsPartIndex, partFileName } from './opfs-recording-parts';
import { useMediaRecorder } from './useMediaRecorder';

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
  const writableRef = useRef<FileSystemWritableFileStream | null>(null);
  const sessionIdRef = useRef<number | null>(null);
  const partIndexRef = useRef(0);

  useEffect(() => {
    if (recordingSessionId === null || recorder === null || !isOpfsSupported()) return;

    let cancelled = false;

    void (async () => {
      if (sessionIdRef.current !== recordingSessionId) {
        try {
          partIndexRef.current = await findLatestOpfsPartIndex(recordingSessionId);
        } catch {
          partIndexRef.current = 0;
        }
        sessionIdRef.current = recordingSessionId;
      }

      if (cancelled) return;

      partIndexRef.current += 1;
      const partName = partFileName(recordingSessionId, partIndexRef.current);

      try {
        const writable = await openOpfsFileForWriting(partName);

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
  }, [recorder, recordingSessionId]);

  // effect 의존성 배열에 안전하게 넣을 수 있도록 참조를 고정한다.
  const appendChunk = useCallback((chunk: Blob) => {
    void writableRef.current?.write(chunk).catch(() => {
      // 개별 chunk 쓰기 실패는 무시한다 — 실시간 전송 경로에는 영향 없다.
    });
  }, []);

  return { appendChunk };
};
