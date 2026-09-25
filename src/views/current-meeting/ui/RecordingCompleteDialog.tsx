'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Square, X } from 'lucide-react';
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
        <AlertDialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex items-start justify-between">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-danger-bg text-danger">
              <Square aria-hidden="true" className="size-4 fill-current" strokeWidth={2} />
            </div>
            <AlertDialog.Close
              aria-label="닫기"
              className="flex size-8 items-center justify-center rounded-lg text-cool-600 hover:bg-cool-50"
            >
              <X aria-hidden="true" className="size-5" />
            </AlertDialog.Close>
          </div>
          <AlertDialog.Title className="mt-4 text-lg font-bold text-cool-900">
            회의를 종료할까요?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-5 text-cool-500">
            회의를 종료하면 녹음을 다시 재개할 수 없습니다. 현재까지의 녹음과 녹취 내용을 바탕으로
            회의 결과가 생성됩니다.
          </AlertDialog.Description>
          <p className="mt-4 rounded-xl bg-cool-50 px-4 py-3 text-sm leading-5 text-cool-600">
            종료 후에는 회의 결과 화면으로 이동합니다.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <AlertDialog.Close className="h-12 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50">
              계속 진행
            </AlertDialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              className="h-12 rounded-xl bg-danger text-sm font-semibold text-white transition-colors hover:bg-danger/90"
            >
              회의 종료
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
