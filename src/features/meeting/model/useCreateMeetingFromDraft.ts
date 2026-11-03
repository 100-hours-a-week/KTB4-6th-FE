'use client';

import { useMutation } from '@tanstack/react-query';
import { createMeeting } from '../api/create-meeting';
import type { MeetingApiError } from './errors';
import type { CreateMeetingData, CreateMeetingDraftRequest } from './types';

interface CreateMeetingFromDraftVariables {
  draft: CreateMeetingDraftRequest;
  aiRequestId: number;
}

export const useCreateMeetingFromDraft = (teamId: number) =>
  useMutation<CreateMeetingData, MeetingApiError, CreateMeetingFromDraftVariables>({
    mutationFn: ({ draft, aiRequestId }) => createMeeting(teamId, draft, { aiRequestId }),
  });
