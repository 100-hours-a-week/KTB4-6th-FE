'use client';

import { useCallback, useEffect } from 'react';
import { isAudioFileExpiredError, useAudioDownloadUrl } from '@/features/meeting';
import { parseServerDate } from '@/shared/lib';
import type { AudioViewState } from './useAudioViewState';

const REFRESH_BEFORE_EXPIRY_MS = 60_000;
const MIN_REFRESH_INTERVAL_MS = 5_000;

export type AudioSourceStatus = 'loading' | 'ready' | 'expired' | 'error';

export const useAudioSource = (audio: AudioViewState, isEnabled: boolean) => {
  const audioFileId = audio.kind === 'available' ? audio.audioFileId : null;
  const downloadUrlQuery = useAudioDownloadUrl(audioFileId ?? undefined, { isEnabled });
  const { data, error, isError, dataUpdatedAt, refetch } = downloadUrlQuery;
  const downloadUrlExpiresAt = data?.downloadUrlExpiresAt;

  const refreshAudioSource = useCallback(() => {
    if (!isEnabled || audioFileId === null) return;
    if (Date.now() - dataUpdatedAt < MIN_REFRESH_INTERVAL_MS) return;

    void refetch({ cancelRefetch: false });
  }, [isEnabled, audioFileId, dataUpdatedAt, refetch]);

  useEffect(() => {
    if (!downloadUrlExpiresAt) return;

    const expiresAtMs = parseServerDate(downloadUrlExpiresAt).getTime();
    const delayMs = Math.max(
      expiresAtMs - Date.now() - REFRESH_BEFORE_EXPIRY_MS,
      MIN_REFRESH_INTERVAL_MS,
    );
    const timer = setTimeout(() => void refetch({ cancelRefetch: false }), delayMs);

    return () => clearTimeout(timer);
  }, [downloadUrlExpiresAt, refetch]);

  const getStatus = (): AudioSourceStatus => {
    if (isError && isAudioFileExpiredError(error)) return 'expired';
    if (isError && data === undefined) return 'error';
    if (data === undefined) return 'loading';

    return 'ready';
  };

  return {
    audioSource: data?.downloadUrl ?? null,
    status: getStatus(),
    refreshAudioSource,
    retry: () => void refetch(),
  };
};
