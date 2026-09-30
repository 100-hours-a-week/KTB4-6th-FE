'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { homeKeys } from '@/features/home';
import { useCreateMeeting, type CreateMeetingFormValues } from '@/features/meeting';

export const useCreateMeetingSubmit = (teamId: number) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isCreating, createError, createMeeting } = useCreateMeeting(teamId);
  // 생성 성공 후 화면이 넘어가기 전까지 다시 제출되어 회의가 중복 생성되지 않게 막는다.
  const [isRedirecting, setIsRedirecting] = useState(false);

  const submit = async (values: CreateMeetingFormValues) => {
    if (isRedirecting) return;

    const meeting = await createMeeting(values);

    if (!meeting) return;

    setIsRedirecting(true);
    void queryClient.invalidateQueries({ queryKey: homeKeys.all });
    router.replace(`/teams/${teamId}/meetings/${meeting.meetingId}`);
  };

  return { isSubmitting: isCreating || isRedirecting, submitError: createError, submit };
};
