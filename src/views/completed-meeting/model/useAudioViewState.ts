'use client';

import { useState } from 'react';
import { useAudioFile } from '@/features/meeting';
import { getAudioRemainingDays } from './get-audio-remaining-days';

export type AudioViewState =
  /** 처음 불러오는 중 */
  | { kind: 'loading' }
  /** 음성 파일 조회에 실패 */
  | { kind: 'error' }
  /** 저장 기한이 지났거나 삭제되어 재생할 수 없음 */
  | { kind: 'expired' }
  | {
      kind: 'available';
      /** 재생 주소를 발급받을 음성 파일. 개발용 미리보기에서는 null */
      audioFileId: number | null;
      remainingDays: number;
      durationSeconds: number;
    };

interface PreviewAudio {
  /** 만료됐으면 null */
  remainingDays: number | null;
  durationSeconds: number;
}

interface UseAudioViewStateParams {
  meetingId: number;
  /** 개발 환경 전용 미리보기 음성 정보. 있으면 조회하지 않고 이 값을 쓴다. */
  previewAudio?: PreviewAudio;
}

/** 헤더·더보기 메뉴·전사 화면이 함께 쓰는 음성 파일 상태를 음성 파일 조회 결과(또는 개발용 미리보기)로 정한다. */
export const useAudioViewState = ({
  meetingId,
  previewAudio,
}: UseAudioViewStateParams): AudioViewState => {
  const audioFileQuery = useAudioFile(meetingId, { isEnabled: previewAudio === undefined });
  // 남은 일수의 기준 시각은 화면을 연 시점으로 고정한다.
  const [now] = useState(() => Date.now());

  if (previewAudio) {
    return previewAudio.remainingDays === null
      ? { kind: 'expired' }
      : {
          kind: 'available',
          audioFileId: null,
          remainingDays: previewAudio.remainingDays,
          durationSeconds: previewAudio.durationSeconds,
        };
  }
  if (audioFileQuery.isPending) return { kind: 'loading' };
  if (audioFileQuery.data === undefined) return { kind: 'error' };

  const { audioFileId, status, expiresAt, durationMs } = audioFileQuery.data;
  const remainingDays = getAudioRemainingDays(expiresAt, now);
  if (status !== 'AVAILABLE' || remainingDays === null) return { kind: 'expired' };

  return {
    kind: 'available',
    audioFileId,
    remainingDays,
    durationSeconds: Math.round(durationMs / 1000),
  };
};
