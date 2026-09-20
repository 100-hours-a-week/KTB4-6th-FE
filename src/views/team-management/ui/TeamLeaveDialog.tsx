'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { LogOut, TriangleAlert } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';

interface TeamLeaveDialogProps {
  hasActiveMeeting: boolean;
  isOpen: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export const TeamLeaveDialog = ({
  hasActiveMeeting,
  isOpen,
  onConfirm,
  onOpenChange,
}: TeamLeaveDialogProps) => {
  const frame = useAppFrameElement();

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Portal container={frame}>
        <AlertDialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex size-10 items-center justify-center rounded-full bg-danger-bg text-danger">
            {hasActiveMeeting ? (
              <TriangleAlert className="size-5" strokeWidth={2} />
            ) : (
              <LogOut className="size-5" strokeWidth={2} />
            )}
          </div>

          <AlertDialog.Title className="mt-3 text-lg font-bold text-cool-900">
            {hasActiveMeeting ? '현재 진행 중인 회의가 있습니다' : '이 팀에서 나가시겠어요?'}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-1.5 text-sm leading-5 text-cool-500">
            {hasActiveMeeting
              ? '팀을 나가면 현재 참여 중인 회의에서도 즉시 나가게 됩니다. 팀의 회의 기록과 정보에는 더 이상 접근할 수 없습니다.'
              : '팀을 나가면 팀의 회의 기록과 정보에 더 이상 접근할 수 없습니다. 계정은 그대로 유지되며, 유효한 초대 코드가 있으면 다시 참여할 수 있습니다.'}
          </AlertDialog.Description>

          <div className="mt-5 flex gap-2">
            <AlertDialog.Close className="h-11 flex-1 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50">
              취소
            </AlertDialog.Close>
            <AlertDialog.Close
              onClick={onConfirm}
              className="h-11 flex-1 rounded-xl bg-danger text-sm font-semibold text-white transition-colors hover:bg-danger/90"
            >
              팀 나가기
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
