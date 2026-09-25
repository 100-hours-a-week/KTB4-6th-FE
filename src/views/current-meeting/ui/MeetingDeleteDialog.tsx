'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { X } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';

interface MeetingDeleteDialogProps {
  isDeleting: boolean;
  isOpen: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export const MeetingDeleteDialog = ({
  isDeleting,
  isOpen,
  onConfirm,
  onOpenChange,
}: MeetingDeleteDialogProps) => {
  const frame = useAppFrameElement();

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={(open) => !isDeleting && onOpenChange(open)}>
      <AlertDialog.Portal container={frame}>
        <AlertDialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex items-start justify-between">
            <div
              aria-hidden="true"
              className="flex size-12 items-center justify-center rounded-2xl bg-danger-bg text-xl font-bold text-danger"
            >
              !
            </div>
            <AlertDialog.Close
              aria-label="닫기"
              disabled={isDeleting}
              className="flex size-8 items-center justify-center rounded-lg text-cool-600 hover:bg-cool-50 disabled:opacity-50"
            >
              <X aria-hidden="true" className="size-5" />
            </AlertDialog.Close>
          </div>
          <AlertDialog.Title className="mt-4 text-lg font-bold text-cool-900">
            회의 내용을 삭제하시겠어요?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-5 text-cool-500">
            삭제한 회의 내용은 복구할 수 없습니다.
          </AlertDialog.Description>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <AlertDialog.Close
              disabled={isDeleting}
              className="h-12 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50 disabled:opacity-50"
            >
              취소
            </AlertDialog.Close>
            <button
              type="button"
              disabled={isDeleting}
              onClick={onConfirm}
              className="h-12 rounded-xl bg-danger text-sm font-semibold text-white transition-colors hover:bg-danger/90 disabled:opacity-60"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
