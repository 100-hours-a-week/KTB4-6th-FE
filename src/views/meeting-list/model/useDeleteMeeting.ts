'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingListKeys } from '@/features/meeting-list';
import { deleteMeeting } from '@/features/meeting-sse';

export const useDeleteMeeting = (teamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingId: number) => deleteMeeting(meetingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meetingListKeys.list(teamId) }),
  });
};
