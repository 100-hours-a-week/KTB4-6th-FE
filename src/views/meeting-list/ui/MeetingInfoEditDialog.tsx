'use client';

import { useEffect, useState } from 'react';
import {
  MeetingApiError,
  toCreateMeetingRequest,
  useMeetingDetail,
  type CreateMeetingFormValues,
} from '@/features/meeting';
import { useAppToast } from '@/shared/ui';
import { MeetingInfoDialog } from '@/widgets/meeting-info-form';
import { useUpdateMeetingInfo } from '../model/useUpdateMeetingInfo';

interface MeetingInfoEditDialogProps {
  meetingId: number;
  teamId: number;
  onClose: () => void;
}

export const MeetingInfoEditDialog = ({
  meetingId,
  teamId,
  onClose,
}: MeetingInfoEditDialogProps) => {
  const { showToast } = useAppToast();
  const { data: meeting, isError } = useMeetingDetail(meetingId);
  const { mutate, isPending } = useUpdateMeetingInfo(teamId);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isError) return;
    showToast('회의 정보를 불러오지 못했습니다. 다시 시도해주세요.', 'danger');
    onClose();
  }, [isError, onClose, showToast]);

  if (!meeting) return null;

  const initialValues: CreateMeetingFormValues = {
    title: meeting.title,
    duration: String(meeting.targetDurationMinutes),
    purpose: meeting.purpose,
    note: meeting.note,
  };

  const handleSubmit = (values: CreateMeetingFormValues) => {
    setSubmitError(null);
    mutate(
      { meetingId, ...toCreateMeetingRequest(values) },
      {
        onSuccess: () => {
          onClose();
          showToast('회의 정보가 수정되었습니다', 'success');
        },
        onError: (error) =>
          setSubmitError(
            error instanceof MeetingApiError ? error.message : '회의 정보 수정에 실패했습니다.',
          ),
      },
    );
  };

  return (
    <MeetingInfoDialog
      initialValues={initialValues}
      isSubmitting={isPending}
      submitError={submitError}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
};
