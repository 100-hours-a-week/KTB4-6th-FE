'use client';

import { useMutation } from '@tanstack/react-query';
import { createMeeting } from '../api/create-meeting';
import { toMeetingInfoRequest, type CreateMeetingFormValues } from './create-meeting-form';
import type { CreateMeetingData, MeetingAttendeesRequest } from './types';

interface CreateMeetingVariables {
  values: CreateMeetingFormValues;
  attendees: MeetingAttendeesRequest;
}

interface UseCreateMeetingOptions {
  onError?: (error: Error) => void;
}

export const useCreateMeeting = (teamId: number, { onError }: UseCreateMeetingOptions = {}) => {
  const mutation = useMutation({
    mutationFn: ({ values, attendees }: CreateMeetingVariables) =>
      createMeeting(teamId, { ...toMeetingInfoRequest(values), ...attendees }),
    onError,
  });

  const createMeetingWithValues = async (
    values: CreateMeetingFormValues,
    attendees: MeetingAttendeesRequest,
  ): Promise<CreateMeetingData | null> => {
    if (mutation.isPending) return null;

    try {
      return await mutation.mutateAsync({ values, attendees });
    } catch {
      return null;
    }
  };

  return {
    isCreating: mutation.isPending,
    createError: mutation.error,
    createMeeting: createMeetingWithValues,
  };
};
