'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingKeys, updateMeeting, type MeetingUpdateRequest } from '@/features/meeting';
import { meetingListKeys } from '@/features/meeting-list';

interface UpdateMeetingInfoVariables extends MeetingUpdateRequest {
  meetingId: number;
}

export const useUpdateMeetingInfo = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ meetingId, ...request }: UpdateMeetingInfoVariables) =>
      updateMeeting(meetingId, request),
    onSuccess: (_, { meetingId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: meetingListKeys.list(teamId) }),
        queryClient.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) }),
      ]),
  });
};
