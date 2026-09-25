'use client';

import { useState, type FormEvent } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { RefreshCw, X } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';

interface SummaryRegenerateReasonDialogProps {
  onNext: () => void;
  onClose: () => void;
}

const REASON_MAX_LENGTH = 100;

/** 요약을 재생성하는 사유를 입력받는 모달. 열릴 때마다 입력값이 비워진 상태로 시작한다. */
export const SummaryRegenerateReasonDialog = ({
  onNext,
  onClose,
}: SummaryRegenerateReasonDialogProps) => {
  const frame = useAppFrameElement();
  const [reason, setReason] = useState('');
  const hasReason = reason.trim().length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (hasReason) onNext();
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal container={frame}>
        <Dialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40" />
        <Dialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] outline-none">
          <form noValidate onSubmit={handleSubmit}>
            <div className="flex items-start justify-between">
              <div
                aria-hidden="true"
                className="flex size-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600"
              >
                <RefreshCw className="size-5" strokeWidth={2} />
              </div>
              <Dialog.Close
                aria-label="닫기"
                className="flex size-8 items-center justify-center rounded-lg text-cool-600 hover:bg-cool-50"
              >
                <X aria-hidden="true" className="size-5" />
              </Dialog.Close>
            </div>
            <Dialog.Title className="mt-4 text-lg font-bold text-cool-900">
              재생성 사유를 알려주세요
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm leading-5 text-cool-600">
              입력하신 사유는 AI 요약 품질 개선에 활용돼요.
            </Dialog.Description>
            <textarea
              autoFocus
              aria-label="재생성 사유"
              value={reason}
              maxLength={REASON_MAX_LENGTH}
              placeholder="재생성 사유를 입력해주세요"
              onChange={(event) => setReason(event.target.value)}
              className="mt-4 h-24 w-full resize-none rounded-xl border border-cool-200 bg-cool-50 p-4 text-sm leading-5 text-cool-900 transition-colors outline-none placeholder:text-cool-400 focus:border-brand-600"
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-cool-500">예: 결정사항이 누락되었어요</span>
              <span className="font-mono text-cool-500 tabular-nums">
                {reason.length}/{REASON_MAX_LENGTH}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Dialog.Close className="h-12 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50">
                취소
              </Dialog.Close>
              <button
                type="submit"
                disabled={!hasReason}
                className="h-12 rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:bg-cool-100 disabled:text-cool-400"
              >
                다음
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
