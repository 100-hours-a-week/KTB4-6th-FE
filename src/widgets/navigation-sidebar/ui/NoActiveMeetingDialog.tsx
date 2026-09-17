'use client';

import type { ReactElement } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Plus, X } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';

interface NoActiveMeetingDialogProps {
  trigger: ReactElement;
}

// "현재 회의" nav 항목이 곧 트리거다. 일반 버튼(Menu.Item이 아님)을 그대로 감싸는 구조라
// Dialog가 열고 닫기를 스스로 처리하는 언컨트롤드 방식을 그대로 쓸 수 있다.
export const NoActiveMeetingDialog = ({ trigger }: NoActiveMeetingDialogProps) => {
  const frame = useAppFrameElement();

  return (
    <Dialog.Root>
      <Dialog.Trigger render={trigger} />

      <Dialog.Portal container={frame}>
        <Dialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex items-center justify-between">
            <div className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Plus className="size-5" strokeWidth={2} />
            </div>
            <Dialog.Close
              aria-label="닫기"
              className="flex size-8 items-center justify-center rounded-full text-cool-400 transition-colors hover:bg-cool-50"
            >
              <X className="size-4" strokeWidth={2} />
            </Dialog.Close>
          </div>

          <Dialog.Title className="mt-3 text-lg font-bold text-cool-900">
            현재 진행 중인 회의가 없어요
          </Dialog.Title>
          <Dialog.Description className="mt-1.5 text-sm leading-5 text-cool-500">
            새로운 회의를 생성해 바로 시작할 수 있어요.
          </Dialog.Description>

          <div className="mt-5 flex gap-2">
            <Dialog.Close className="h-11 flex-1 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50">
              취소
            </Dialog.Close>
            <Dialog.Close className="h-11 flex-1 rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
              회의 생성하기
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
