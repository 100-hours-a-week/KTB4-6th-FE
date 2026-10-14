'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { homeKeys } from '@/features/home';
import {
  useCreateMeeting,
  type CreateMeetingFormValues,
  type MeetingAttendeesRequest,
} from '@/features/meeting';

export const useCreateMeetingSubmit = (teamId: number, attendees: MeetingAttendeesRequest) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isCreating, createError, createMeeting } = useCreateMeeting(teamId);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const submit = async (values: CreateMeetingFormValues) => {
    if (isRedirecting) return;

    const meeting = await createMeeting(values, attendees);

    if (!meeting) return;

    setIsRedirecting(true);
    void queryClient.invalidateQueries({ queryKey: homeKeys.all });
    router.replace(`/teams/${teamId}/meetings/${meeting.meetingId}`);
  };

  return { isSubmitting: isCreating || isRedirecting, submitError: createError, submit };
};
