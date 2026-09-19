'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Crown } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';

interface LeaderDelegateDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  participantName: string;
}

export const LeaderDelegateDialog = ({
  isOpen,
  onConfirm,
  onOpenChange,
  participantName,
}: LeaderDelegateDialogProps) => {
  const frame = useAppFrameElement();

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Portal container={frame}>
        <AlertDialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Crown className="size-5" strokeWidth={2} />
          </div>

          <AlertDialog.Title className="mt-3 text-lg font-bold text-cool-900">
            팀장 권한을 {participantName}에게 위임할까요?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-1.5 text-sm leading-5 text-cool-500">
            {participantName}님에게 팀장을 위임할까요? 위임 후에는 회원님이 일반 팀원이 됩니다. 이
            작업은 되돌릴 수 없습니다.
          </AlertDialog.Description>

          <div className="mt-5 flex gap-2">
            <AlertDialog.Close className="h-11 flex-1 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50">
              취소
            </AlertDialog.Close>
            <AlertDialog.Close
              onClick={onConfirm}
              className="h-11 flex-1 rounded-xl bg-cool-900 text-sm font-semibold text-white transition-colors hover:bg-cool-900/90"
            >
              위임하기
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
