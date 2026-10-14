'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { homeKeys } from '@/features/home';
import { useCreateMeeting, type CreateMeetingFormValues } from '@/features/meeting';
import { useTeamDetail } from '@/features/team-management';

export const useCreateMeetingSubmit = (teamId: number) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: team } = useTeamDetail(teamId);
  const { isCreating, createError, createMeeting } = useCreateMeeting(teamId);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const submit = async (values: CreateMeetingFormValues) => {
    if (isRedirecting || !team) return;

    const meeting = await createMeeting(values, {
      attendeeTeamMemberIds: [team.teamMemberId],
      customAttendeeNames: [],
    });

    if (!meeting) return;

    setIsRedirecting(true);
    void queryClient.invalidateQueries({ queryKey: homeKeys.all });
    router.replace(`/teams/${teamId}/meetings/${meeting.meetingId}`);
  };

  return { isSubmitting: isCreating || isRedirecting, submitError: createError, submit };
};
