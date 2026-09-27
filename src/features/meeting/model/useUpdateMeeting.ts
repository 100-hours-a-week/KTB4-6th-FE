'use client';

import { useMutation } from '@tanstack/react-query';
import { updateMeeting } from '../api/update-meeting';
import type { MeetingUpdateRequest } from './types';

interface UpdateMeetingVariables extends MeetingUpdateRequest {
  meetingId: number;
}

export const useUpdateMeeting = () =>
  useMutation({
    mutationFn: ({ meetingId, ...request }: UpdateMeetingVariables) =>
      updateMeeting(meetingId, request),
  });
