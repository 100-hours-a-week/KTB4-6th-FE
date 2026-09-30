'use client';

import { MeetingInfoDialog } from '@/widgets/meeting-info-form';
import { useCreateMeetingSubmit } from '../model/useCreateMeetingSubmit';

interface CreateMeetingDialogProps {
  teamId: number;
  onClose: () => void;
}

export const CreateMeetingDialog = ({ teamId, onClose }: CreateMeetingDialogProps) => {
  const { isSubmitting, submitError, submit } = useCreateMeetingSubmit(teamId);

  return (
    <MeetingInfoDialog
      closeLabel="회의 생성 취소"
      isSubmitting={isSubmitting}
      submitError={submitError}
      onSubmit={submit}
      onClose={onClose}
    />
  );
};
