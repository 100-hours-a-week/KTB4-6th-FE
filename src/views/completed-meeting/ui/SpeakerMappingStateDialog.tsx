'use client';

import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';

interface SpeakerMappingStateDialogProps {
  status: 'loading' | 'error';
  onRetry: () => void;
  onClose: () => void;
}

/** 발화자 연결 정보를 불러오는 동안, 또는 불러오지 못했을 때 보여주는 모달 */
export const SpeakerMappingStateDialog = ({
  status,
  onRetry,
  onClose,
}: SpeakerMappingStateDialogProps) => {
  const frame = useAppFrameElement();

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal container={frame}>
        <Dialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40" />
        <Dialog.Popup className="absolute top-1/2 left-1/2 z-[90] flex w-[calc(100%-2rem)] max-w-[358px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] outline-none">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-cool-900">팀 멤버 연결</Dialog.Title>
            <Dialog.Close
              aria-label="닫기"
              className="-mr-1.5 flex size-8 items-center justify-center rounded-lg text-cool-600 hover:bg-cool-50"
            >
              <X aria-hidden="true" className="size-5" />
            </Dialog.Close>
          </div>

          {status === 'loading' ? (
            <div
              role="status"
              aria-label="발화자 연결 정보를 불러오는 중입니다"
              className="mt-5 flex flex-col gap-2"
            >
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  aria-hidden="true"
                  className="h-[52px] rounded-xl border border-cool-200 bg-cool-50"
                />
              ))}
            </div>
          ) : (
            <div role="alert" className="mt-5 flex flex-col items-center py-4 text-center">
              <p className="text-base font-bold text-cool-900">
                발화자 연결 정보를 불러오지 못했습니다
              </p>
              <p className="mt-2 text-sm leading-6 text-cool-600">잠시 후 다시 시도해주세요.</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-5 h-12 w-full max-w-[220px] rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                다시 불러오기
              </button>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
