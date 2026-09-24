'use client';

import { useAppToast } from '@/shared/ui';
import { MEETING_DELETE_BLOCKED_TOAST, MEETING_LEAVE_BLOCKED_TOAST } from './blocked-action-toasts';
import { useMeetingDelete } from './useMeetingDelete';
import { useMeetingLeave } from './useMeetingLeave';

interface UseMeetingControlActionsParams {
  teamId: string;
  meetingId: string;
  canDelete: boolean;
  isMeetingInProgress: boolean;
}

/**
 * 더보기 메뉴의 나가기·삭제 동작을 조립한다.
 * 진행 중인 회의에서는 요청 없이 사유를 토스트로 안내하고, 그 외에는 각 흐름을 실행한다.
 */
export const useMeetingControlActions = ({
  teamId,
  meetingId,
  canDelete,
  isMeetingInProgress,
}: UseMeetingControlActionsParams) => {
  const { showToast } = useAppToast();
  const { isLeaving, handleLeave } = useMeetingLeave({ teamId, meetingId });
  const { isDeleting, isDeleteDialogOpen, setIsDeleteDialogOpen, handleDelete } = useMeetingDelete({
    teamId,
    meetingId,
    canDelete,
  });

  const handleDeleteRequest = () => {
    if (isMeetingInProgress) {
      showToast(MEETING_DELETE_BLOCKED_TOAST.message, MEETING_DELETE_BLOCKED_TOAST.variant);
      return;
    }

    setIsDeleteDialogOpen(true);
  };

  const handleLeaveRequest = () => {
    if (isMeetingInProgress) {
      showToast(MEETING_LEAVE_BLOCKED_TOAST.message, MEETING_LEAVE_BLOCKED_TOAST.variant);
      return;
    }

    void handleLeave();
  };

  return {
    isLeaving,
    isDeleting,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleLeave,
    handleDelete,
    handleDeleteRequest,
    handleLeaveRequest,
  };
};
