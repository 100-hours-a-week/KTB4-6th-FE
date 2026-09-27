'use client';

import { useQuery } from '@tanstack/react-query';
import { getAudioFile } from '../api/get-audio-file';
import { meetingKeys } from './query-keys';

interface UseAudioFileOptions {
  isEnabled?: boolean;
}

/** 회의 녹음 파일의 정보. 음성 파일이 없으면 404 AUDIO_FILE_NOT_FOUND 오류가 된다. */
export const useAudioFile = (meetingId: number, { isEnabled = true }: UseAudioFileOptions = {}) =>
  useQuery({
    queryKey: meetingKeys.audioFile(meetingId),
    queryFn: () => getAudioFile(meetingId),
    enabled: isEnabled,
  });
