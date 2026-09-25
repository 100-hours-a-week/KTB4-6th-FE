'use client';

import { useMemo } from 'react';
import { createSilentAudioBlob } from './create-silent-audio-blob';

/**
 * 개발 환경 전용 미리보기가 재생할 음성. isEnabled일 때만 만든다.
 * 실제 음성 파일이 없어도 재생 동작을 확인하도록 무음 파일을 만들어 쓴다.
 */
export const usePreviewAudioSource = (durationSeconds: number, isEnabled: boolean) =>
  useMemo(
    // 서버 렌더링에서는 재생할 일이 없어 큰 파일을 만들지 않는다.
    () =>
      isEnabled && typeof window !== 'undefined' ? createSilentAudioBlob(durationSeconds) : null,
    [durationSeconds, isEnabled],
  );
