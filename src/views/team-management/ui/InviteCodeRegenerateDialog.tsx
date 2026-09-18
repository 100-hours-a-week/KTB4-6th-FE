'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { RefreshCw } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';

interface InviteCodeRegenerateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteCodeRegenerateDialog = ({
  isOpen,
  onOpenChange,
}: InviteCodeRegenerateDialogProps) => {
  const frame = useAppFrameElement();

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Portal container={frame}>
        <AlertDialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <RefreshCw className="size-5" strokeWidth={2} />
          </div>

          <AlertDialog.Title className="mt-3 text-lg font-bold text-cool-900">
            초대 코드를 재생성하시겠어요?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-1.5 text-sm leading-5 text-cool-500">
            초대 코드는 하루에 한 번만 재생성할 수 있습니다.
          </AlertDialog.Description>

          <div className="mt-5 flex gap-2">
            <AlertDialog.Close className="h-11 flex-1 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50">
              취소
            </AlertDialog.Close>
            <AlertDialog.Close className="h-11 flex-1 rounded-xl bg-cool-900 text-sm font-semibold text-white transition-colors hover:bg-cool-900/90">
              재생성
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
