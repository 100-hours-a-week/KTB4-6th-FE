'use client';

import type { MeetingAttendeesRequest } from '@/features/meeting';
import { MeetingInfoDialog } from '@/widgets/meeting-info-form';
import { useCreateMeetingSubmit } from '../model/useCreateMeetingSubmit';

interface CreateMeetingDialogProps {
  teamId: number;
  attendees: MeetingAttendeesRequest;
  onBack: () => void;
  onClose: () => void;
}

export const CreateMeetingDialog = ({
  teamId,
  attendees,
  onBack,
  onClose,
}: CreateMeetingDialogProps) => {
  const { isSubmitting, submitError, submit } = useCreateMeetingSubmit(teamId, attendees);

  return (
    <MeetingInfoDialog
      closeLabel="회의 생성 취소"
      isSubmitting={isSubmitting}
      submitError={submitError}
      onSubmit={submit}
      onClose={onClose}
      onBack={onBack}
    />
  );
};
