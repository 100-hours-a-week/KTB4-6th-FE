'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { TriangleAlert } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';

interface WithdrawConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 탈퇴하기는 더보기 드롭다운(Menu.Item) 안에서 열린다. Menu.Item은 클릭 시 메뉴 자체를
// 닫아버리기 때문에, 이 메뉴 항목을 그대로 Dialog.Trigger로 감싸는 언컨트롤드 방식은 쓸 수 없다
// (Base UI 공식 문서의 "Open from a menu" 가이드도 이 경우엔 컨트롤드 방식을 권장한다).
// 그래서 open 상태를 SidebarMoreMenu가 들고, 메뉴 항목 onClick에서 이 모달을 직접 연다.
export const WithdrawConfirmDialog = ({ isOpen, onOpenChange }: WithdrawConfirmDialogProps) => {
  const frame = useAppFrameElement();

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Portal container={frame}>
        <AlertDialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="absolute top-1/2 left-1/2 z-[90] w-[calc(100%-3rem)] max-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-[0_16px_40px_rgba(20,34,56,0.2)] transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex size-10 items-center justify-center rounded-full bg-danger-bg text-danger">
            <TriangleAlert className="size-5" strokeWidth={2} />
          </div>

          <AlertDialog.Title className="mt-3 text-lg font-bold text-cool-900">
            정말 탈퇴하시겠어요?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-1.5 text-sm leading-5 text-cool-500">
            탈퇴하면 계정 정보와 모든 팀 데이터 접근 권한이 삭제되며, 복구할 수 없습니다.
          </AlertDialog.Description>

          <div className="mt-5 flex gap-2">
            <AlertDialog.Close className="h-11 flex-1 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50">
              취소
            </AlertDialog.Close>
            <AlertDialog.Close className="h-11 flex-1 rounded-xl bg-danger text-sm font-semibold text-white transition-colors hover:bg-danger/90">
              탈퇴하기
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
