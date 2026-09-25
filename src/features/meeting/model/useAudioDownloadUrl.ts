'use client';

import { useQuery } from '@tanstack/react-query';
import { getAudioDownloadUrl } from '../api/get-audio-download-url';
import { meetingKeys } from './query-keys';

interface UseAudioDownloadUrlOptions {
  isEnabled?: boolean;
}

/**
 * 음성 파일의 재생 주소.
 * 주소가 바뀌면 재생이 처음부터 다시 시작되므로, 화면에 다시 초점이 맞을 때나 오래됐다는 이유로는 다시 받지 않는다.
 * 주소가 만료되면 refetch로 직접 다시 받는다.
 */
export const useAudioDownloadUrl = (
  audioFileId: number | undefined,
  { isEnabled = true }: UseAudioDownloadUrlOptions = {},
) =>
  useQuery({
    queryKey: meetingKeys.audioDownloadUrl(audioFileId ?? 0),
    queryFn: () => getAudioDownloadUrl(audioFileId as number),
    enabled: isEnabled && audioFileId !== undefined,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
