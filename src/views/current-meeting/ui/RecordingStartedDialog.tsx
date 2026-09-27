'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { useAppFrameElement } from '@/shared/lib';

interface RecordingStartedDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RecordingStartedDialog = ({ isOpen, onOpenChange }: RecordingStartedDialogProps) => {
  const frame = useAppFrameElement();

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Portal container={frame}>
        <AlertDialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-danger-bg text-danger">
            <span
              aria-hidden="true"
              className="flex size-6 items-center justify-center rounded-full border-2 border-danger"
            >
              <span className="size-2.5 rounded-full bg-danger" />
            </span>
          </div>
          <AlertDialog.Title className="mt-4 text-lg font-bold text-cool-900">
            회의 녹음이 시작되었습니다
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-5 text-cool-500">
            지금부터 이 회의의 모든 대화가 녹음됩니다.
          </AlertDialog.Description>
          <p className="mt-4 rounded-xl bg-cool-50 px-4 py-3 text-sm leading-5 text-cool-600">
            녹음된 음성은 전사 및 AI 회의 리포트 생성에 사용되며 팀 저장 공간에 보관됩니다.
          </p>
          <AlertDialog.Close className="mt-5 h-12 w-full rounded-xl bg-brand-600 text-sm font-semibold text-white">
            확인
          </AlertDialog.Close>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
