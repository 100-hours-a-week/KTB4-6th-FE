'use client';

import { useRef, useState } from 'react';
import {
  isInvalidMeetingAttendeeError,
  isMeetingDraftNotConfirmedError,
  type MeetingApiError,
  useCreateMeetingFromDraft,
} from '@/features/meeting';
import type { AssistantChatMeetingDraft, AssistantChatMeetingDraftResult } from './types';

const toDraftErrorMessage = (error: MeetingApiError) => {
  if (isMeetingDraftNotConfirmedError(error)) {
    return '초안이 확인되지 않았어요. 미티에게 다시 요청해 주세요.';
  }
  if (isInvalidMeetingAttendeeError(error)) {
    return '참여자 정보가 바뀌었어요. 미티에게 다시 요청해 주세요.';
  }
  return error.message;
};

export const useAssistantChatMeetingDraftConfirm = (teamId: number) => {
  const [draftResults, setDraftResults] = useState<
    ReadonlyMap<number, AssistantChatMeetingDraftResult>
  >(() => new Map());
  const isCreatingRef = useRef(false);
  const { mutate } = useCreateMeetingFromDraft(teamId);

  const setDraftResult = (requestId: number, result: AssistantChatMeetingDraftResult) => {
    setDraftResults((prev) => new Map(prev).set(requestId, result));
  };

  const confirmMeetingDraft = (requestId: number, draft: AssistantChatMeetingDraft) => {
    if (isCreatingRef.current) return;

    isCreatingRef.current = true;
    setDraftResult(requestId, { status: 'sending' });
    mutate(
      { draft, aiRequestId: requestId },
      {
        onSuccess: ({ meetingId }) => setDraftResult(requestId, { status: 'confirmed', meetingId }),
        onError: (error) =>
          setDraftResult(requestId, { status: 'failed', errorMessage: toDraftErrorMessage(error) }),
        onSettled: () => {
          isCreatingRef.current = false;
        },
      },
    );
  };

  return { draftResults, confirmMeetingDraft };
};
