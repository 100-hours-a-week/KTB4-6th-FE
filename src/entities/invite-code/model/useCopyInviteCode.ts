'use client';

import { useCopyToClipboard } from '@/shared/lib';
import { useAppToast } from '@/shared/ui';
import { INVITE_CODE_COPY_FAILURE_MESSAGE, INVITE_CODE_COPY_SUCCESS_MESSAGE } from './messages';

// 초대 코드 복사 + 결과 토스트 노출을 한 번에 묶은 훅.
export const useCopyInviteCode = () => {
  const { copyStatus, copyToClipboard } = useCopyToClipboard();
  const { showToast } = useAppToast();

  const copyInviteCode = async (inviteCode: string) => {
    const isSuccess = await copyToClipboard(inviteCode);

    showToast(
      isSuccess ? INVITE_CODE_COPY_SUCCESS_MESSAGE : INVITE_CODE_COPY_FAILURE_MESSAGE,
      isSuccess ? 'success' : 'danger',
    );

    return isSuccess;
  };

  return { copyInviteCode, copyStatus };
};
