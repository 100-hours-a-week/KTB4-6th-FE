'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMeetingExit } from '@/features/meeting-sse';
import { useAppToast } from '@/shared/ui';

interface UseMeetingDeleteParams {
  teamId: string;
  meetingId: string;
  canDelete: boolean;
}

/** 회의 삭제 확인 모달의 열림 여부와 삭제 요청을 관리하고, 성공하면 홈 캐시를 갱신한 뒤 팀 홈으로 이동한다. */
export const useMeetingDelete = ({ teamId, meetingId, canDelete }: UseMeetingDeleteParams) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useAppToast();
  const { remove } = useMeetingExit(meetingId);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await remove();
      void queryClient.invalidateQueries({ queryKey: ['home'] });
      router.replace(`/teams/${encodeURIComponent(teamId)}`);
    } catch {
      showToast('회의 삭제에 실패했습니다', 'danger');
      setIsDeleting(false);
    }
  };

  return { isDeleting, isDeleteDialogOpen, setIsDeleteDialogOpen, handleDelete };
};
