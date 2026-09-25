'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { CircleDollarSign } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';

interface InsufficientCreditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InsufficientCreditDialog = ({
  isOpen,
  onOpenChange,
}: InsufficientCreditDialogProps) => {
  const frame = useAppFrameElement();

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Portal container={frame}>
        <AlertDialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex size-10 items-center justify-center rounded-full bg-danger-bg text-danger">
            <CircleDollarSign aria-hidden="true" className="size-5" strokeWidth={2} />
          </div>
          <AlertDialog.Title className="mt-3 text-lg font-bold text-cool-900">
            크레딧이 부족해요
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-1.5 text-sm leading-5 text-cool-500">
            팀 크레딧이 부족해 녹음을 시작할 수 없습니다. 녹음을 시작하려면 20 크레딧이 필요합니다.
          </AlertDialog.Description>
          <AlertDialog.Close className="mt-5 h-11 w-full rounded-xl bg-brand-600 text-sm font-semibold text-white">
            확인
          </AlertDialog.Close>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
