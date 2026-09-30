'use client';

import { useState } from 'react';
import { Menu } from '@base-ui/react/menu';
import { LogOut, MoreVertical, UserX } from 'lucide-react';
import { useLogout } from '@/features/auth';
import { useAppFrameElement } from '@/shared/lib';
import { useAppToast } from '@/shared/ui';
import { WithdrawConfirmDialog } from './WithdrawConfirmDialog';

// 로그아웃/탈퇴하기 드롭다운. 열고 닫기는 Menu가 자체적으로 관리한다(언컨트롤드).
// 탈퇴 확인 모달의 open 상태만 여기서 들고 있다가 "탈퇴하기" 클릭 시 직접 연다.
export const SidebarMoreMenu = () => {
  const frame = useAppFrameElement();
  const { showToast } = useAppToast();
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const logoutMutation = useLogout();
  // 성공 후 이동하기 전까지도 다시 누르지 못하게 막는다.
  const isLoggingOut = logoutMutation.isPending || logoutMutation.isSuccess;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => window.location.replace('/'),
      onError: (error) => showToast(error.message, 'danger'),
    });
  };

  return (
    <>
      <Menu.Root>
        <Menu.Trigger className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-cool-700 transition-colors hover:bg-cool-100">
          <MoreVertical className="size-4" strokeWidth={2} />
          더보기
        </Menu.Trigger>

        <Menu.Portal container={frame}>
          <Menu.Positioner className="z-[75] outline-none" side="top" align="end" sideOffset={6}>
            <Menu.Popup className="min-w-[152px] rounded-xl border border-cool-100 bg-white py-1 shadow-[0_8px_24px_rgba(20,34,56,0.12)] outline-none">
              <Menu.Item
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-cool-700 outline-none select-none data-highlighted:bg-cool-50 data-disabled:opacity-50"
              >
                <LogOut className="size-4" strokeWidth={2} />
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </Menu.Item>
              <Menu.Item
                onClick={() => setIsWithdrawDialogOpen(true)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-danger outline-none select-none data-highlighted:bg-danger-bg"
              >
                <UserX className="size-4" strokeWidth={2} />
                탈퇴하기
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <WithdrawConfirmDialog isOpen={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen} />
    </>
  );
};
