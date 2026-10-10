'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { CircleDollarSign } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';

interface ChatCreditNoticeDialogProps {
  isOpen: boolean;
  currentCredit: number;
  creditCost: number;
  onCancel: () => void;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export const ChatCreditNoticeDialog = ({
  isOpen,
  currentCredit,
  creditCost,
  onCancel,
  onConfirm,
  onOpenChange,
}: ChatCreditNoticeDialogProps) => {
  const frame = useAppFrameElement();

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Portal container={frame}>
        <AlertDialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/55 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <CircleDollarSign aria-hidden="true" className="size-6" strokeWidth={2} />
          </div>
          <AlertDialog.Title className="mt-4 text-center text-lg font-bold text-cool-900">
            AI 채팅은 크레딧을 사용해요
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-center text-sm leading-6 text-cool-600">
            질문 1회마다 팀 크레딧 {creditCost}이 차감됩니다.
            <br />
            질문과 답변은 회의 참여자 모두에게 공개됩니다.
          </AlertDialog.Description>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-cool-50 px-4 py-3 text-sm text-cool-700">
            <span>팀 크레딧</span>
            <strong className="font-bold text-cool-900">
              {currentCredit} → {Math.max(0, currentCredit - creditCost)}
            </strong>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <AlertDialog.Close
              onClick={onCancel}
              className="h-12 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50"
            >
              취소
            </AlertDialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              className="h-12 rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              보내기
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
