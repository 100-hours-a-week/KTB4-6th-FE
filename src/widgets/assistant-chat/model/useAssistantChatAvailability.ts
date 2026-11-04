'use client';

import { usePathname } from 'next/navigation';
import { PREFETCHED_MEETING_STALE_TIME, useMeetingDetail } from '@/features/meeting';

const HIDDEN_PATH_PATTERN = /\/(meetings\/new|voice-consent)\/?$/;
const MEETING_PATH_PATTERN = /\/meetings\/(\d+)\/?$/;

export const useAssistantChatAvailability = () => {
  const pathname = usePathname();
  const meetingId = Number(MEETING_PATH_PATTERN.exec(pathname)?.[1] ?? 0);
  const meetingQuery = useMeetingDetail(meetingId, {
    isEnabled: meetingId > 0,
    staleTime: PREFETCHED_MEETING_STALE_TIME,
  });

  if (HIDDEN_PATH_PATTERN.test(pathname)) return false;
  if (meetingId > 0) return meetingQuery.data?.status === 'COMPLETED';
  return true;
};
