'use client';

import { useMemo } from 'react';
import { createSilentAudioBlob } from './create-silent-audio-blob';

/**
 * 재생할 음성. isEnabled일 때만 만든다.
 * TODO: 음성 파일 다운로드 URL 조회 API(GET /api/v1/audio-files/{audioFileId}/download-url)의
 * downloadUrl로 교체한다. 지금은 개발 화면에서 재생 동작을 확인하도록 무음 파일을 만들어 쓴다.
 */
export const usePreviewAudioSource = (durationSeconds: number, isEnabled: boolean) =>
  useMemo(
    // 서버 렌더링에서는 재생할 일이 없어 큰 파일을 만들지 않는다.
    () =>
      isEnabled && typeof window !== 'undefined' ? createSilentAudioBlob(durationSeconds) : null,
    [durationSeconds, isEnabled],
  );
