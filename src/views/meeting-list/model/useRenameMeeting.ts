'use client';

import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { updateMeeting } from '@/features/meeting';
import {
  meetingListKeys,
  type MeetingListData,
  type MeetingListGroupData,
} from '@/features/meeting-list';

interface RenameMeetingVariables {
  meetingId: number;
  title: string;
}

const renameMeetingInGroup = (
  group: MeetingListGroupData,
  meetingId: number,
  title: string,
): MeetingListGroupData => ({
  ...group,
  meetings: group.meetings.map((meeting) =>
    meeting.meetingId === meetingId ? { ...meeting, title } : meeting,
  ),
});

const renameMeetingInPage = (
  page: MeetingListData,
  meetingId: number,
  title: string,
): MeetingListData => ({
  ...page,
  groups: page.groups.map((group) => renameMeetingInGroup(group, meetingId, title)),
});

export const useRenameMeeting = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ meetingId, title }: RenameMeetingVariables) =>
      updateMeeting(meetingId, { title }),
    onSuccess: (updated) => {
      queryClient.setQueryData<InfiniteData<MeetingListData>>(
        meetingListKeys.list(teamId),
        (cache) =>
          cache && {
            ...cache,
            pages: cache.pages.map((page) =>
              renameMeetingInPage(page, updated.meetingId, updated.title),
            ),
          },
      );

      queryClient.setQueriesData<MeetingListData>(
        { queryKey: meetingListKeys.todayAll(teamId) },
        (cache) => cache && renameMeetingInPage(cache, updated.meetingId, updated.title),
      );
    },
  });
};
