'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  MeetingApiError,
  toCreateMeetingRequest,
  useUpdateMeeting,
  type CreateMeetingFormValues,
} from '@/features/meeting';
import { getCurrentMeetingQueryKey } from '@/features/meeting-sse';
import { useAppToast } from '@/shared/ui';
import type { CurrentMeetingViewModel } from './preview-meeting';

interface UseMeetingInfoEditParams {
  meetingId: number;
  meeting: CurrentMeetingViewModel | null;
}

/**
 * 회의 정보 수정 안내 모달과 입력 모달의 열림 여부를 관리하고, 저장 요청을 보낸다.
 * 입력 모달에는 현재 회의 정보를 기존 값으로 채워 보여준다.
 */
export const useMeetingInfoEdit = ({ meetingId, meeting }: UseMeetingInfoEditParams) => {
  const queryClient = useQueryClient();
  const { showToast } = useAppToast();
  const { mutate, isPending } = useUpdateMeeting();
  const [isEditNoticeOpen, setIsEditNoticeOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const editFormInitialValues: CreateMeetingFormValues | null = meeting && {
    title: meeting.title,
    duration: String(meeting.targetMinutes),
    purpose: meeting.purpose,
    note: meeting.note,
  };

  const handleEditInfo = () => setIsEditNoticeOpen(true);

  const handleConfirmEditNotice = () => {
    setIsEditNoticeOpen(false);
    setSubmitError(null);
    setIsEditFormOpen(true);
  };

  const handleSubmitEditForm = (values: CreateMeetingFormValues) => {
    setSubmitError(null);
    mutate(
      { meetingId, ...toCreateMeetingRequest(values) },
      {
        onSuccess: () => {
          // 목표 시간·목적·비고가 바뀌었을 수 있어 조회 결과를 다시 받아온다.
          void queryClient.invalidateQueries({ queryKey: getCurrentMeetingQueryKey(meetingId) });
          setIsEditFormOpen(false);
          showToast('회의 정보가 수정되었습니다', 'success');
        },
        onError: (error) => {
          setSubmitError(
            error instanceof MeetingApiError ? error.message : '회의 정보 수정에 실패했습니다.',
          );
        },
      },
    );
  };

  const handleCloseEditForm = () => setIsEditFormOpen(false);

  return {
    isEditNoticeOpen,
    isEditFormOpen,
    editFormInitialValues,
    isSubmitting: isPending,
    submitError,
    setIsEditNoticeOpen,
    handleEditInfo,
    handleConfirmEditNotice,
    handleSubmitEditForm,
    handleCloseEditForm,
  };
};
