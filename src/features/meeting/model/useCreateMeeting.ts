'use client';

import { useMutation } from '@tanstack/react-query';
import { createMeeting } from '../api/create-meeting';
import { toCreateMeetingRequest, type CreateMeetingFormValues } from './create-meeting-form';
import type { CreateMeetingData } from './types';

export const useCreateMeeting = (teamId: number) => {
  const mutation = useMutation({
    mutationFn: (values: CreateMeetingFormValues) =>
      createMeeting(teamId, toCreateMeetingRequest(values)),
  });

  const createMeetingWithValues = async (
    values: CreateMeetingFormValues,
  ): Promise<CreateMeetingData | null> => {
    if (mutation.isPending) return null;

    try {
      return await mutation.mutateAsync(values);
    } catch {
      return null;
    }
  };

  return {
    isCreating: mutation.isPending,
    createError: mutation.error?.message ?? null,
    createMeeting: createMeetingWithValues,
  };
};
