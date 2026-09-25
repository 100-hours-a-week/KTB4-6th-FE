'use client';

import { useCallback, useEffect } from 'react';
import { isAudioFileExpiredError, useAudioDownloadUrl } from '@/features/meeting';
import { parseServerDate } from './parse-server-date';
import type { AudioViewState } from './useAudioViewState';

/** 재생 주소가 만료되기 이 시간 전에 미리 새 주소를 받는다. */
const REFRESH_BEFORE_EXPIRY_MS = 60_000;
/** 주소를 받은 직후에 다시 받으려는 요청은 무시한다. 재생할 수 없는 파일에서 요청이 반복되지 않게 한다. */
const MIN_REFRESH_INTERVAL_MS = 5_000;

export type AudioSourceStatus =
  /** 재생 주소를 받는 중이거나, 받을 필요가 없음(개발용 미리보기 포함) */
  | 'loading'
  | 'ready'
  /** 보관 기간이 지나 재생 주소를 받을 수 없음 */
  | 'expired'
  /** 재생 주소를 받지 못함 */
  | 'error';

/**
 * 플레이어가 재생할 음성 주소. 음성 파일 정보를 받은 뒤 그 파일의 재생 주소를 발급받아 쓴다.
 * 주소를 받기 전에는 null이라 재생할 수 없다. isEnabled가 false면 주소를 발급받지 않는다.
 *
 * 재생 주소는 만료 시각이 지나면 재생·탐색이 실패하므로, 만료 직전에 새 주소를 받고
 * refreshAudioSource로 실패했을 때도 다시 받을 수 있다.
 * 개발용 미리보기는 음성 파일이 없어 주소를 발급받지 않고 재생할 수 없다.
 */
export const useAudioSource = (audio: AudioViewState, isEnabled: boolean) => {
  const audioFileId = audio.kind === 'available' ? audio.audioFileId : null;
  const downloadUrlQuery = useAudioDownloadUrl(audioFileId ?? undefined, { isEnabled });
  const { data, error, isError, dataUpdatedAt, refetch } = downloadUrlQuery;
  const downloadUrlExpiresAt = data?.downloadUrlExpiresAt;

  const refreshAudioSource = useCallback(() => {
    if (!isEnabled || audioFileId === null) return;
    if (Date.now() - dataUpdatedAt < MIN_REFRESH_INTERVAL_MS) return;

    // 이미 다시 받는 중이면 그 요청을 끊지 않고 기다린다.
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
    // 주소를 새로 받을 때마다(만료 시각이 바뀔 때마다) 다음 갱신을 다시 예약한다.
  }, [downloadUrlExpiresAt, refetch]);

  const getStatus = (): AudioSourceStatus => {
    // 재생 중에 주소를 다시 받다 실패해도, 만료가 아니면 받아 둔 주소로 계속 재생한다.
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
