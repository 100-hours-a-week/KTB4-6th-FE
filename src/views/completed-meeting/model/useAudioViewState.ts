'use client';

import { useEffect, useState } from 'react';
import {
  isAudioFileNotAvailableError,
  isAudioFileNotFoundError,
  useAudioFile,
} from '@/features/meeting';
import { parseServerDate } from '@/shared/lib';
import { getAudioRemainingDays } from './get-audio-remaining-days';

const UPLOADING_REFETCH_INTERVAL_MS = 10_000;
const UPLOAD_WAIT_LIMIT_MS = 7 * 60 * 1000;

const isAudioUploadingError = (error: unknown) =>
  isAudioFileNotAvailableError(error) || isAudioFileNotFoundError(error);

export type AudioViewState =
  /** 처음 불러오는 중 */
  | { kind: 'loading' }
  /** 음성 파일 조회에 실패 */
  | { kind: 'error' }
  | { kind: 'uploading' }
  /** 저장 기한이 지났거나 삭제되어 재생할 수 없음 */
  | { kind: 'expired' }
  | {
      kind: 'available';
      /** 재생 주소를 발급받을 음성 파일 */
      audioFileId: number;
      remainingDays: number;
      durationSeconds: number;
    };

interface UseAudioViewStateParams {
  meetingId: number;
  endedAt: string | null;
}

/**
 * 헤더·더보기 메뉴·전사 화면이 함께 쓰는 음성 파일 상태를 음성 파일 조회 결과로 정한다.
 * 음성 파일 조회에 실패했을 때 retry로 다시 조회한다.
 */
export const useAudioViewState = ({ meetingId, endedAt }: UseAudioViewStateParams) => {
  const uploadDeadline = endedAt ? parseServerDate(endedAt).getTime() + UPLOAD_WAIT_LIMIT_MS : null;
  const [uploadCheckedAt, setUploadCheckedAt] = useState(() => Date.now());
  const isWaitingForUpload = uploadDeadline !== null && uploadCheckedAt < uploadDeadline;
  const audioFileQuery = useAudioFile(meetingId, {
    getRefetchInterval: (error) =>
      isAudioUploadingError(error) && uploadDeadline !== null && Date.now() < uploadDeadline
        ? UPLOADING_REFETCH_INTERVAL_MS
        : false,
  });

  useEffect(() => {
    if (uploadDeadline === null) return;
    const remainingMs = uploadDeadline - Date.now();
    if (remainingMs <= 0) return;

    const timer = setTimeout(() => setUploadCheckedAt(Date.now()), remainingMs);
    return () => clearTimeout(timer);
  }, [uploadDeadline]);
  // 남은 일수의 기준 시각은 화면을 연 시점으로 고정한다.
  const [now] = useState(() => Date.now());

  const getState = (): AudioViewState => {
    if (audioFileQuery.isPending) return { kind: 'loading' };
    if (isWaitingForUpload && isAudioUploadingError(audioFileQuery.error)) {
      return { kind: 'uploading' };
    }
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

  return { state: getState(), retry: () => void audioFileQuery.refetch() };
};
