'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { CircleDollarSign, X } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';

const RECORDING_CREDIT_COST = 20;

interface InsufficientCreditDialogProps {
  isOpen: boolean;
  currentCredit?: number;
  onOpenChange: (open: boolean) => void;
}

export const InsufficientCreditDialog = ({
  isOpen,
  currentCredit,
  onOpenChange,
}: InsufficientCreditDialogProps) => {
  const frame = useAppFrameElement();

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Portal container={frame}>
        <AlertDialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex items-start justify-between">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-danger-bg text-danger">
              <CircleDollarSign aria-hidden="true" className="size-5" strokeWidth={2} />
            </div>
            <AlertDialog.Close
              aria-label="닫기"
              className="flex size-8 items-center justify-center rounded-lg text-cool-600 hover:bg-cool-50"
            >
              <X aria-hidden="true" className="size-5" />
            </AlertDialog.Close>
          </div>
          <AlertDialog.Title className="mt-4 text-lg font-bold text-cool-900">
            크레딧이 부족해요
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-5 text-cool-500">
            {`녹음 시작에는 ${RECORDING_CREDIT_COST} 크레딧이 필요합니다.`}
            {currentCredit !== undefined && ` (현재 크레딧: ${currentCredit})`}
          </AlertDialog.Description>
          <AlertDialog.Close className="mt-5 h-12 w-full rounded-xl bg-brand-600 text-sm font-semibold text-white">
            확인
          </AlertDialog.Close>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
