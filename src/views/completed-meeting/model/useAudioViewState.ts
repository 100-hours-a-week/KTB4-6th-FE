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
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'uploading' }
  | { kind: 'expired' }
  | {
      kind: 'available';
      audioFileId: number;
      remainingDays: number;
      durationSeconds: number;
    };

interface UseAudioViewStateParams {
  meetingId: number;
  endedAt: string | null;
}

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
