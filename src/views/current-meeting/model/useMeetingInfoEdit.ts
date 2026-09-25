'use client';

import { useState } from 'react';
import type { CreateMeetingFormValues } from '@/features/meeting';
import type { CurrentMeetingViewModel } from './preview-meeting';

/**
 * 회의 정보 수정 안내 모달과 입력 모달의 열림 여부를 관리한다.
 * 입력 모달에는 현재 회의 정보를 기존 값으로 채워 보여준다.
 */
export const useMeetingInfoEdit = (meeting: CurrentMeetingViewModel | null) => {
  const [isEditNoticeOpen, setIsEditNoticeOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const editFormInitialValues: CreateMeetingFormValues | null = meeting && {
    title: meeting.title,
    duration: String(meeting.targetMinutes),
    purpose: meeting.purpose,
    note: meeting.note,
  };

  const handleEditInfo = () => setIsEditNoticeOpen(true);

  const handleConfirmEditNotice = () => {
    setIsEditNoticeOpen(false);
    setIsEditFormOpen(true);
  };

  // TODO: 회의 수정 API(PATCH /api/v1/meetings/{meetingId}) 연동 시 저장 요청으로 교체한다.
  const handleSubmitEditForm = () => setIsEditFormOpen(false);

  const handleCloseEditForm = () => setIsEditFormOpen(false);

  return {
    isEditNoticeOpen,
    isEditFormOpen,
    editFormInitialValues,
    setIsEditNoticeOpen,
    handleEditInfo,
    handleConfirmEditNotice,
    handleSubmitEditForm,
    handleCloseEditForm,
  };
};
