'use client';

import { useQuery } from '@tanstack/react-query';
import { getMeetingTranscript } from '../api/get-meeting-transcript';
import { meetingKeys } from './query-keys';

interface UseMeetingTranscriptOptions {
  isEnabled?: boolean;
}

/** 회의의 전사 목록. 발화가 없으면 data가 빈 배열이다. */
export const useMeetingTranscript = (
  meetingId: number,
  { isEnabled = true }: UseMeetingTranscriptOptions = {},
) =>
  useQuery({
    queryKey: meetingKeys.transcript(meetingId),
    queryFn: () => getMeetingTranscript(meetingId),
    enabled: isEnabled,
  });
