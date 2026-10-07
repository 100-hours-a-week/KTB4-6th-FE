'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMeeting } from '@/features/meeting';
import { meetingListKeys } from '@/features/meeting-list';

interface RenameMeetingVariables {
  meetingId: number;
  title: string;
}

export const useRenameMeeting = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ meetingId, title }: RenameMeetingVariables) =>
      updateMeeting(meetingId, { title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meetingListKeys.list(teamId) }),
  });
};
