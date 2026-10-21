'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { TriangleAlert } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';
import type { RecordingStorageNotice } from '../model/useRecordingStorageNotice';

const NOTICE_CONTENTS: Record<RecordingStorageNotice, { title: string; description: string }> = {
  'low-storage': {
    title: '기기 저장 공간이 부족합니다',
    description: '녹음 파일이 기기에 저장되지 않을 수 있습니다.',
  },
  'save-failed': {
    title: '녹음 파일을 저장하지 못하고 있습니다',
    description: '기기 저장 공간이 부족하거나\n브라우저 저장소에 문제가 생겼습니다.',
  },
};

interface RecordingStorageNoticeDialogProps {
  notice: RecordingStorageNotice | null;
  onClose: () => void;
}

export const RecordingStorageNoticeDialog = ({
  notice,
  onClose,
}: RecordingStorageNoticeDialogProps) => {
  const frame = useAppFrameElement();
  const content = notice ? NOTICE_CONTENTS[notice] : null;

  return (
    <AlertDialog.Root open={notice !== null} onOpenChange={(open) => !open && onClose()}>
      <AlertDialog.Portal container={frame}>
        <AlertDialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <TriangleAlert aria-hidden="true" className="size-6" strokeWidth={2} />
          </div>
          <AlertDialog.Title className="mt-4 text-lg font-bold text-cool-900">
            {content?.title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-5 whitespace-pre-line text-cool-500">
            {content?.description}
          </AlertDialog.Description>
          <p className="mt-4 rounded-xl bg-cool-50 px-4 py-3 text-sm leading-5 text-cool-600">
            실시간 기록은 그대로 진행됩니다. 녹음 파일까지 남기려면 기기 저장 공간을 확보해주세요.
          </p>
          <AlertDialog.Close className="mt-5 h-12 w-full rounded-xl bg-brand-600 text-sm font-semibold text-white">
            확인
          </AlertDialog.Close>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
