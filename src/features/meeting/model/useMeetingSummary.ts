'use client';

import { useQuery } from '@tanstack/react-query';
import { getMeetingSummary } from '../api/get-meeting-summary';
import { meetingKeys } from './query-keys';

interface UseMeetingSummaryOptions {
  isEnabled?: boolean;
}

/** 회의의 최신 AI 요약. 아직 요약이 없으면 data가 null이다. */
export const useMeetingSummary = (
  meetingId: number,
  { isEnabled = true }: UseMeetingSummaryOptions = {},
) =>
  useQuery({
    queryKey: meetingKeys.summary(meetingId),
    queryFn: () => getMeetingSummary(meetingId),
    enabled: isEnabled,
  });
