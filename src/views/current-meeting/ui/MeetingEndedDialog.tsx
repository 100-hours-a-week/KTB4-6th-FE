'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Check } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';

interface MeetingEndedDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onGoHome: () => void;
}

/** 회의가 종료됐음을 알리고 회의 결과 화면 또는 홈으로 이동하게 한다. 이동 버튼으로만 닫힌다. */
export const MeetingEndedDialog = ({ isOpen, onConfirm, onGoHome }: MeetingEndedDialogProps) => {
  const frame = useAppFrameElement();

  return (
    <AlertDialog.Root open={isOpen}>
      <AlertDialog.Portal container={frame}>
        <AlertDialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <button
            type="button"
            onClick={onGoHome}
            className="absolute top-5 right-5 text-sm font-medium text-cool-600"
          >
            홈으로
          </button>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-success-bg text-success">
            <Check aria-hidden="true" className="size-5" strokeWidth={2.4} />
          </div>
          <AlertDialog.Title className="mt-4 text-lg font-bold text-cool-900">
            회의가 종료되었습니다
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-6 text-cool-500">
            회의 진행자가 회의를 종료했습니다.
            <br />
            회의 내용을 정리하고 있습니다.
          </AlertDialog.Description>
          <button
            type="button"
            onClick={onConfirm}
            className="mt-5 h-12 w-full rounded-xl bg-brand-600 text-sm font-semibold text-white"
          >
            회의 결과 확인하기
          </button>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
