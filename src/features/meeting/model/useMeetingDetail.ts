'use client';

import { useQuery } from '@tanstack/react-query';
import { getMeetingDetail } from '../api/get-meeting-detail';
import { meetingKeys } from './query-keys';

interface UseMeetingDetailOptions {
  isEnabled?: boolean;
}

/** 회의 상세 정보. */
export const useMeetingDetail = (
  meetingId: number,
  { isEnabled = true }: UseMeetingDetailOptions = {},
) =>
  useQuery({
    queryKey: meetingKeys.detail(meetingId),
    queryFn: () => getMeetingDetail(meetingId),
    enabled: isEnabled,
  });
