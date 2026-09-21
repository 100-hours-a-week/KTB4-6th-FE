'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { TriangleAlert } from 'lucide-react';
import { useWithdraw } from '@/features/auth';
import { useAppFrameElement } from '@/shared/lib';
import { useAppToast } from '@/shared/ui';

interface WithdrawConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WithdrawConfirmDialog = ({ isOpen, onOpenChange }: WithdrawConfirmDialogProps) => {
  const frame = useAppFrameElement();
  const { showToast } = useAppToast();
  const withdrawMutation = useWithdraw();
  // 성공 후 이동하기 전까지도 다시 누르거나 닫지 못하게 막는다.
  const isWithdrawing = withdrawMutation.isPending || withdrawMutation.isSuccess;

  const handleWithdraw = () => {
    withdrawMutation.mutate(undefined, {
      // 전체 새로고침으로 이동해 메모리에 남은 쿼리 캐시까지 비운다.
      onSuccess: () => window.location.replace('/'),
      onError: (error) => {
        showToast(error.message, 'danger');
        onOpenChange(false);
      },
    });
  };

  return (
    <AlertDialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!isWithdrawing) onOpenChange(open);
      }}
    >
      <AlertDialog.Portal container={frame}>
        <AlertDialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex size-10 items-center justify-center rounded-full bg-danger-bg text-danger">
            <TriangleAlert className="size-5" strokeWidth={2} />
          </div>

          <AlertDialog.Title className="mt-3 text-lg font-bold text-cool-900">
            정말 탈퇴하시겠어요?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-1.5 text-sm leading-5 text-cool-500">
            탈퇴하면 계정 정보와 모든 팀 데이터 접근 권한이 삭제되며, 복구할 수 없습니다.
          </AlertDialog.Description>

          <div className="mt-5 flex gap-2">
            <AlertDialog.Close
              disabled={isWithdrawing}
              className="h-11 flex-1 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50 disabled:opacity-50"
            >
              취소
            </AlertDialog.Close>
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="h-11 flex-1 rounded-xl bg-danger text-sm font-semibold text-white transition-colors hover:bg-danger/90 disabled:opacity-50"
            >
              {isWithdrawing ? '탈퇴 중...' : '탈퇴하기'}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
