'use client';

import { useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';
import { useCreateMeetingSubmit } from '../model/useCreateMeetingSubmit';
import { CreateMeetingForm } from './CreateMeetingForm';

interface CreateMeetingDialogProps {
  teamId: number;
  onClose: () => void;
}

const CREATE_MEETING_FORM_ID = 'create-meeting-form';

export const CreateMeetingDialog = ({ teamId, onClose }: CreateMeetingDialogProps) => {
  const frame = useAppFrameElement();
  const [isFormValid, setIsFormValid] = useState(false);
  const { isSubmitting, submitError, submit } = useCreateMeetingSubmit(teamId);

  return (
    <Dialog.Root open onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <Dialog.Portal container={frame}>
        <Dialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/45" />
        <Dialog.Popup className="absolute inset-x-5 top-[72px] bottom-[68px] z-[90] flex flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_20px_48px_rgba(20,34,56,0.24)] outline-none">
          <div className="relative shrink-0 px-6 pt-9 pb-5 text-center">
            <Dialog.Title className="text-xl font-bold text-cool-900">
              회의 정보를 입력해주세요
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-cool-600">
              Meety에서 사용할 회의 정보를 입력해주세요.
            </Dialog.Description>
            <Dialog.Close
              aria-label="회의 생성 취소"
              className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full text-cool-500 transition-colors hover:bg-cool-50"
            >
              <X className="size-5" strokeWidth={2} />
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 [scrollbar-color:var(--color-brand-300)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-brand-300 [&::-webkit-scrollbar-thumb:hover]:bg-brand-400 [&::-webkit-scrollbar-track]:bg-transparent">
            <CreateMeetingForm
              formId={CREATE_MEETING_FORM_ID}
              onSubmit={submit}
              onValidityChange={setIsFormValid}
            />
          </div>

          <div className="shrink-0 border-t border-cool-200 bg-white px-6 py-5">
            {submitError && (
              <p role="alert" className="mb-3 text-center text-sm text-danger">
                {submitError}
              </p>
            )}
            <div className="flex gap-3">
              <Dialog.Close
                disabled={isSubmitting}
                className="h-14 flex-1 rounded-xl border border-cool-200 text-base font-semibold text-cool-700 transition-colors hover:bg-cool-50 disabled:text-cool-400 disabled:hover:bg-transparent"
              >
                취소
              </Dialog.Close>
              <button
                type="submit"
                form={CREATE_MEETING_FORM_ID}
                disabled={!isFormValid || isSubmitting}
                className="h-14 flex-1 rounded-xl bg-brand-600 text-base font-semibold text-white transition-colors hover:bg-brand-700 disabled:bg-cool-200 disabled:text-cool-400"
              >
                {isSubmitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
