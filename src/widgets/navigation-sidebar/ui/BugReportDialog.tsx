'use client';

import { useState, type FormEvent } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Bug, X } from 'lucide-react';
import { useSendBugReport } from '@/features/bug-report';
import { useAppFrameElement } from '@/shared/lib';
import { useAppToast } from '@/shared/ui';

interface BugReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const TITLE_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 500;

/** 버그 제보 입력 모달. 제출하면 Next 서버를 거쳐 디스코드로 바로 알림이 간다. */
export const BugReportDialog = ({ isOpen, onOpenChange }: BugReportDialogProps) => {
  const frame = useAppFrameElement();
  const { showToast } = useAppToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { mutate, isPending } = useSendBugReport();
  const isValid = title.trim().length > 0 && description.trim().length > 0;

  const handleClose = () => {
    if (isPending) return;
    onOpenChange(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || isPending) return;

    mutate(
      { title: title.trim(), description: description.trim() },
      {
        onSuccess: () => {
          showToast('버그 제보가 전송되었습니다', 'success');
          setTitle('');
          setDescription('');
          onOpenChange(false);
        },
        onError: (error) => showToast(error.message, 'danger'),
      },
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal container={frame}>
        <Dialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40" />
        <Dialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] outline-none">
          <form noValidate onSubmit={handleSubmit}>
            <div className="flex items-start justify-between">
              <div
                aria-hidden="true"
                className="flex size-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600"
              >
                <Bug className="size-5" strokeWidth={2} />
              </div>
              <Dialog.Close
                aria-label="닫기"
                disabled={isPending}
                onClick={handleClose}
                className="flex size-8 items-center justify-center rounded-lg text-cool-600 hover:bg-cool-50"
              >
                <X aria-hidden="true" className="size-5" />
              </Dialog.Close>
            </div>
            <Dialog.Title className="mt-4 text-lg font-bold text-cool-900">
              버그를 제보해주세요
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm leading-5 text-cool-600">
              보내주신 내용은 바로 개발팀에 전달됩니다.
            </Dialog.Description>

            <input
              autoFocus
              aria-label="버그 제목"
              value={title}
              maxLength={TITLE_MAX_LENGTH}
              placeholder="어떤 문제인지 한 줄로 알려주세요"
              onChange={(event) => setTitle(event.target.value)}
              className="mt-4 h-12 w-full rounded-xl border border-cool-200 bg-cool-50 px-4 text-sm text-cool-900 transition-colors outline-none placeholder:text-cool-400 focus:border-brand-600"
            />
            <textarea
              aria-label="버그 상세 내용"
              value={description}
              maxLength={DESCRIPTION_MAX_LENGTH}
              placeholder="언제, 어떻게 발생했는지 알려주세요"
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 h-28 w-full resize-none rounded-xl border border-cool-200 bg-cool-50 p-4 text-sm leading-5 text-cool-900 transition-colors outline-none placeholder:text-cool-400 focus:border-brand-600"
            />
            <p className="mt-2 text-right text-xs font-mono text-cool-500 tabular-nums">
              {description.length}/{DESCRIPTION_MAX_LENGTH}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Dialog.Close
                disabled={isPending}
                onClick={handleClose}
                className="h-12 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50 disabled:opacity-50"
              >
                취소
              </Dialog.Close>
              <button
                type="submit"
                disabled={!isValid || isPending}
                className="h-12 rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:bg-cool-100 disabled:text-cool-400"
              >
                {isPending ? '전송 중...' : '보내기'}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
