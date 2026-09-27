'use client';

import { useMeetingList } from '@/features/meeting-list';
import { toMeetings } from './map-meeting-list';
import type { Meeting, MeetingListStatus } from './type';

interface UseMeetingListPageDataResult {
  status: MeetingListStatus;
  meetings: Meeting[];
}

export const useMeetingListPageData = (teamId: number): UseMeetingListPageDataResult => {
  const { status, data } = useMeetingList(teamId);

  if (data) return { status: 'success', meetings: toMeetings(data.pages) };
  if (status === 'error') return { status: 'error', meetings: [] };

  return { status: 'loading', meetings: [] };
};
