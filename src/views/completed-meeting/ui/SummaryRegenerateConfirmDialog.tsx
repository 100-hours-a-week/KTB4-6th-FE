'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { RefreshCw, X } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';
import { SUMMARY_REGENERATE_CREDIT_COST } from '../model/summary-regenerate-credit';

interface SummaryRegenerateConfirmDialogProps {
  isRegenerating: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** 크레딧이 소모된다는 점을 알리고 요약 재생성을 최종 확인받는 모달 */
export const SummaryRegenerateConfirmDialog = ({
  isRegenerating,
  onConfirm,
  onClose,
}: SummaryRegenerateConfirmDialogProps) => {
  const frame = useAppFrameElement();

  return (
    <AlertDialog.Root open onOpenChange={(open) => !open && !isRegenerating && onClose()}>
      <AlertDialog.Portal container={frame}>
        <AlertDialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40" />
        <AlertDialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] outline-none">
          <div className="flex items-start justify-between">
            <div
              aria-hidden="true"
              className="flex size-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600"
            >
              <RefreshCw className="size-5" strokeWidth={2} />
            </div>
            <AlertDialog.Close
              aria-label="닫기"
              disabled={isRegenerating}
              className="flex size-8 items-center justify-center rounded-lg text-cool-600 hover:bg-cool-50"
            >
              <X aria-hidden="true" className="size-5" />
            </AlertDialog.Close>
          </div>
          <AlertDialog.Title className="mt-4 text-lg font-bold text-cool-900">
            요약을 재생성할까요?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-5 text-cool-500">
            현재 전사를 바탕으로 요약을 재생성합니다. 재생성에는 {SUMMARY_REGENERATE_CREDIT_COST}{' '}
            크레딧이 소모됩니다.
          </AlertDialog.Description>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <AlertDialog.Close
              disabled={isRegenerating}
              className="h-12 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50 disabled:opacity-50"
            >
              취소
            </AlertDialog.Close>
            <button
              type="button"
              disabled={isRegenerating}
              onClick={onConfirm}
              className="h-12 rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {isRegenerating ? '재생성 중...' : '재생성'}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
