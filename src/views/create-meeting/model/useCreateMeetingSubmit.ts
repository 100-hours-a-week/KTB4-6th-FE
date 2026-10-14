'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { homeKeys } from '@/features/home';
import {
  isInvalidMeetingAttendeeError,
  useCreateMeeting,
  type CreateMeetingFormValues,
  type MeetingAttendeesRequest,
} from '@/features/meeting';
import { teamKeys } from '@/features/team-management';

export const useCreateMeetingSubmit = (teamId: number, attendees: MeetingAttendeesRequest) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isCreating, createError, createMeeting } = useCreateMeeting(teamId, {
    onError: (error) => {
      if (isInvalidMeetingAttendeeError(error)) {
        void queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
        void queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) });
      }
    },
  });
  const [isRedirecting, setIsRedirecting] = useState(false);

  const submit = async (values: CreateMeetingFormValues) => {
    if (isRedirecting) return;

    const meeting = await createMeeting(values, attendees);

    if (!meeting) return;

    setIsRedirecting(true);
    void queryClient.invalidateQueries({ queryKey: homeKeys.all });
    router.replace(`/teams/${teamId}/meetings/${meeting.meetingId}`);
  };

  const submitError = isInvalidMeetingAttendeeError(createError)
    ? '참여자 정보가 바뀌었어요. 다시 선택해주세요.'
    : (createError?.message ?? null);

  return { isSubmitting: isCreating || isRedirecting, submitError, submit };
};
