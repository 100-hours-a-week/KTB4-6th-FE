'use client';

import { useState, type FormEvent } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Pencil, X } from 'lucide-react';
import {
  CREATE_MEETING_TITLE_MAX_LENGTH,
  CREATE_MEETING_TITLE_MIN_LENGTH,
  getCreateMeetingTitleError,
} from '@/features/meeting';
import { cn, useAppFrameElement } from '@/shared/lib';

interface MeetingRenameDialogProps {
  currentTitle: string;
  onConfirm: (title: string) => void;
  onClose: () => void;
}

const TITLE_HINT = `${CREATE_MEETING_TITLE_MIN_LENGTH}자 이상 ${CREATE_MEETING_TITLE_MAX_LENGTH}자 이하`;

export const MeetingRenameDialog = ({
  currentTitle,
  onConfirm,
  onClose,
}: MeetingRenameDialogProps) => {
  const frame = useAppFrameElement();
  const [title, setTitle] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const titleError = getCreateMeetingTitleError(title);
  const isValid = titleError === '';
  const isInvalidInput = isTouched && !isValid;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isValid) onConfirm(title.trim());
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
                <Pencil className="size-5" strokeWidth={2} />
              </div>
              <Dialog.Close
                aria-label="닫기"
                className="flex size-8 items-center justify-center rounded-lg text-cool-600 hover:bg-cool-50"
              >
                <X aria-hidden="true" className="size-5" />
              </Dialog.Close>
            </div>
            <Dialog.Title className="mt-4 text-lg font-bold text-cool-900">
              회의 이름 변경
            </Dialog.Title>

            <input
              autoFocus
              aria-label="새 회의 이름"
              aria-invalid={isInvalidInput}
              aria-describedby="rename-title-help"
              value={title}
              placeholder={currentTitle}
              maxLength={CREATE_MEETING_TITLE_MAX_LENGTH + 1}
              onChange={(event) => {
                setTitle(event.target.value);
                setIsTouched(true);
              }}
              className={cn(
                'mt-4 h-12 w-full rounded-xl border bg-cool-50 px-4 text-base font-medium text-cool-900 transition-colors outline-none placeholder:font-normal placeholder:text-cool-400',
                isInvalidInput
                  ? 'border-danger ring-4 ring-danger/15'
                  : 'border-cool-200 focus:border-brand-600',
              )}
            />
            <div className="mt-2 flex items-start justify-between gap-3 text-xs">
              {/* 오류가 있으면 안내 문구 자리에 오류를 보여준다 */}
              <span
                id="rename-title-help"
                role={isInvalidInput ? 'alert' : undefined}
                className={isInvalidInput ? 'text-danger' : 'text-cool-500'}
              >
                {isInvalidInput ? titleError : TITLE_HINT}
              </span>
              <span className="shrink-0 font-mono text-cool-500 tabular-nums">
                {title.length}/{CREATE_MEETING_TITLE_MAX_LENGTH}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Dialog.Close className="h-12 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50">
                취소
              </Dialog.Close>
              <button
                type="submit"
                disabled={!isValid}
                className="h-12 rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:bg-cool-100 disabled:text-cool-400"
              >
                확인
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
