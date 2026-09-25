'use client';

import { useAudioDownloadUrl } from '@/features/meeting';
import type { AudioViewState } from './useAudioViewState';
import { usePreviewAudioSource } from './usePreviewAudioSource';

/**
 * 플레이어가 재생할 음성. 음성 파일 정보를 받은 뒤 그 파일의 재생 주소를 발급받아 쓴다.
 * 주소를 받기 전에는 null이라 재생할 수 없다. isEnabled가 false면 주소를 발급받지 않는다.
 */
export const useAudioSource = (audio: AudioViewState, isEnabled: boolean) => {
  const audioFileId = audio.kind === 'available' ? audio.audioFileId : null;
  const durationSeconds = audio.kind === 'available' ? audio.durationSeconds : 0;
  // 개발용 미리보기는 음성 파일이 없어 발급받지 않고 무음 파일을 쓴다.
  const isPreview = audio.kind === 'available' && audioFileId === null;

  const previewSource = usePreviewAudioSource(durationSeconds, isEnabled && isPreview);
  const downloadUrlQuery = useAudioDownloadUrl(audioFileId ?? undefined, { isEnabled });

  return isPreview ? previewSource : (downloadUrlQuery.data?.downloadUrl ?? null);
};
