'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Square } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';

interface RecordingCompleteDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export const RecordingCompleteDialog = ({
  isOpen,
  onConfirm,
  onOpenChange,
}: RecordingCompleteDialogProps) => {
  const frame = useAppFrameElement();

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Portal container={frame}>
        <AlertDialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex size-10 items-center justify-center rounded-full bg-danger-bg text-danger">
            <Square aria-hidden="true" className="size-4 fill-current" strokeWidth={2} />
          </div>
          <AlertDialog.Title className="mt-3 text-lg font-bold text-cool-900">
            회의를 종료할까요?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-1.5 text-sm leading-5 text-cool-500">
            녹음이 끝나고 녹음 파일과 녹취 내용이 저장됩니다. 종료한 회의는 다시 시작할 수 없습니다.
          </AlertDialog.Description>
          <div className="mt-5 flex gap-2">
            <AlertDialog.Close className="h-11 flex-1 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50">
              취소
            </AlertDialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              className="h-11 flex-1 rounded-xl bg-danger text-sm font-semibold text-white transition-colors hover:bg-danger/90"
            >
              회의 종료
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
