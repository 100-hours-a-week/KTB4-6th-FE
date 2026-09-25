'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { X } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}

/** 복구할 수 없는 삭제를 확인받는 모달. 회의 삭제와 음성 삭제에서 함께 쓴다. */
export const DeleteConfirmDialog = ({
  title,
  description,
  onConfirm,
  onClose,
}: DeleteConfirmDialogProps) => {
  const frame = useAppFrameElement();

  return (
    <AlertDialog.Root open onOpenChange={(open) => !open && onClose()}>
      <AlertDialog.Portal container={frame}>
        <AlertDialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40" />
        <AlertDialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] outline-none">
          <div className="flex items-start justify-between">
            <div
              aria-hidden="true"
              className="flex size-12 items-center justify-center rounded-2xl bg-danger-bg text-xl font-bold text-danger"
            >
              !
            </div>
            <AlertDialog.Close
              aria-label="닫기"
              className="flex size-8 items-center justify-center rounded-lg text-cool-600 hover:bg-cool-50"
            >
              <X aria-hidden="true" className="size-5" />
            </AlertDialog.Close>
          </div>
          <AlertDialog.Title className="mt-4 text-lg font-bold text-cool-900">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-5 text-cool-500">
            {description}
          </AlertDialog.Description>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <AlertDialog.Close className="h-12 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50">
              취소
            </AlertDialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              className="h-12 rounded-xl bg-danger text-sm font-semibold text-white transition-colors hover:bg-danger/90"
            >
              삭제
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
