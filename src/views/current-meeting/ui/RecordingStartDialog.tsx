'use client';

import { Dialog } from '@base-ui/react/dialog';
import { CircleDollarSign, Clock3, FileText, Mic, Pause, UsersRound, X } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';

interface RecordingStartDialogProps {
  isAcknowledged: boolean;
  isOpen: boolean;
  isStarting: boolean;
  onAcknowledgedChange: (acknowledged: boolean) => void;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export const RecordingStartDialog = ({
  isAcknowledged,
  isOpen,
  isStarting,
  onAcknowledgedChange,
  onConfirm,
  onOpenChange,
}: RecordingStartDialogProps) => {
  const frame = useAppFrameElement();

  const handleOpenChange = (open: boolean) => {
    if (isStarting) return;
    onOpenChange(open);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal container={frame}>
        <Dialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="absolute top-1/2 left-1/2 z-[90] max-h-[calc(100%-3rem)] w-[calc(100%-3rem)] max-w-[340px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white shadow-[0_16px_40px_rgba(20,34,56,0.2)] transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="px-5 pt-5 pb-4">
            <Dialog.Close
              aria-label="닫기"
              disabled={isStarting}
              className="ml-auto flex size-8 items-center justify-center rounded-lg text-cool-600 hover:bg-cool-50 disabled:opacity-50"
            >
              <X aria-hidden="true" className="size-5" />
            </Dialog.Close>

            <div className="mx-auto mt-1 flex size-12 items-center justify-center rounded-2xl bg-danger-bg text-danger">
              <span aria-hidden="true" className="size-4 rounded-full bg-danger" />
            </div>
            <Dialog.Title className="mt-4 text-center text-lg font-bold text-cool-900">
              회의 녹음을 시작할까요?
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              녹음 안내를 확인하고 동의하면 마이크 권한을 요청합니다.
            </Dialog.Description>

            <ul className="mt-5 space-y-3 text-sm leading-6 text-cool-700">
              <li className="flex gap-3">
                <Mic aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-600" />
                <span>마이크 권한이 필요합니다.</span>
              </li>
              <li className="flex gap-3">
                <Clock3 aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-600" />
                <span>최대 90분간 회의를 진행할 수 있습니다.</span>
              </li>
              <li className="flex gap-3">
                <UsersRound aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-600" />
                <span>참여자 전체에게 녹음 사실이 안내됩니다.</span>
              </li>
              <li className="flex gap-3">
                <Pause aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-600" />
                <span>녹음 시작한 사람만 일시정지·종료가 가능합니다.</span>
              </li>
              <li className="flex gap-3">
                <FileText aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-600" />
                <span>녹음 파일은 전사와 AI 리포트 생성에 활용됩니다.</span>
              </li>
              <li className="flex gap-3">
                <CircleDollarSign
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-brand-600"
                />
                <span>녹음 시작 시 20 크레딧이 차감됩니다.</span>
              </li>
            </ul>

            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-cool-200 px-3 py-3 text-sm font-medium text-cool-900">
              <input
                type="checkbox"
                checked={isAcknowledged}
                disabled={isStarting}
                onChange={(event) => onAcknowledgedChange(event.target.checked)}
                className="size-5 shrink-0 accent-brand-600"
              />
              위 내용을 모두 확인했습니다.
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-cool-200 px-5 py-4">
            <Dialog.Close
              disabled={isStarting}
              className="h-12 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 disabled:opacity-50"
            >
              취소
            </Dialog.Close>
            <button
              type="button"
              disabled={!isAcknowledged || isStarting}
              onClick={onConfirm}
              className="h-12 rounded-xl bg-brand-600 text-sm font-semibold text-white disabled:bg-cool-200 disabled:text-cool-400"
            >
              {isStarting ? '시작 중...' : '녹음 시작'}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
