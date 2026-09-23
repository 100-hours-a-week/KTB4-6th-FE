'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Drawer } from '@base-ui/react/drawer';
import { Home, ListChecks, Radio, Users, X } from 'lucide-react';
import { useActiveMeeting } from '@/features/home';
import { useTeamCredits } from '@/features/team-management';
import { useAppFrameElement } from '@/shared/lib';
import { NoActiveMeetingDialog } from './NoActiveMeetingDialog';
import { SidebarMoreMenu } from './SidebarMoreMenu';
import { SidebarNavItem } from './SidebarNavItem';

interface NavigationSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: number;
  teamName: string;
}

// 트리거(햄버거 버튼)가 HomeHeader라는 다른 컴포넌트에 있어서 컨트롤드로 연다/닫는다.
// isOpen/onOpenChange는 부모(HomePage)가 들고 있는 상태를 그대로 받는다.
export const NavigationSidebar = ({
  isOpen,
  onOpenChange,
  teamId,
  teamName,
}: NavigationSidebarProps) => {
  const frame = useAppFrameElement();
  const { data: credits } = useTeamCredits(teamId);
  const { activeMeeting, isPending: isActiveMeetingPending } = useActiveMeeting(teamId);
  const router = useRouter();
  const pathname = usePathname();
  const homePath = `/teams/${teamId}`;
  const managePath = `${homePath}/manage`;
  const currentMeetingPath = activeMeeting
    ? `${homePath}/meetings/${activeMeeting.meetingId}`
    : null;

  const navigateTo = (path: string) => {
    if (pathname !== path) router.push(path);
    onOpenChange(false);
  };

  const currentMeetingNavItem = (
    <SidebarNavItem
      icon={<Radio className="size-5" strokeWidth={2} />}
      label="현재 회의"
      disabled={isActiveMeetingPending}
      isActive={currentMeetingPath !== null && pathname === currentMeetingPath}
      onClick={currentMeetingPath ? () => navigateTo(currentMeetingPath) : undefined}
    />
  );
  const teamNameCharacters = Array.from(teamName);
  const displayTeamName =
    teamNameCharacters.length > 8 ? `${teamNameCharacters.slice(0, 8).join('')}…` : teamName;

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange} swipeDirection="left">
      <Drawer.Portal container={frame}>
        <Drawer.Backdrop className="absolute inset-0 z-[60] bg-cool-900/40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />

        <Drawer.Viewport className="absolute inset-0 z-[60] flex items-stretch justify-start">
          <Drawer.Popup className="flex h-full w-[280px] max-w-[85%] flex-col border-r border-cool-100 bg-white px-5 py-6 shadow-[8px_0_24px_rgba(20,34,56,0.12)] transition-transform duration-200 ease-out [transform:translateX(var(--drawer-swipe-movement-x))] data-ending-style:-translate-x-full data-starting-style:-translate-x-full">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold tracking-tight text-cool-900">
                Meety
              </span>
              <Drawer.Close
                aria-label="사이드바 닫기"
                className="flex size-8 items-center justify-center rounded-full text-cool-500 transition-colors hover:bg-cool-100"
              >
                <X className="size-4" strokeWidth={2} />
              </Drawer.Close>
            </div>

            <div className="mt-6">
              <p className="text-xs text-cool-500">팀 스페이스</p>
              <p className="mt-1 line-clamp-1 text-lg font-bold text-cool-900">{displayTeamName}</p>
            </div>

            <div className="mt-4 rounded-xl bg-cool-50 px-4 py-3">
              <span className="text-lg font-bold text-cool-900">{credits?.balance ?? '-'}</span>
              <span className="ml-1 text-sm text-cool-500">크레딧</span>
            </div>

            <nav className="mt-6 flex flex-col gap-1">
              <SidebarNavItem
                icon={<Home className="size-5" strokeWidth={2} />}
                label="홈"
                isActive={pathname === homePath}
                onClick={() => navigateTo(homePath)}
              />
              <SidebarNavItem
                icon={<Users className="size-5" strokeWidth={2} />}
                label="팀"
                isActive={pathname === managePath}
                onClick={() => navigateTo(managePath)}
              />
              {activeMeeting ? (
                currentMeetingNavItem
              ) : (
                <NoActiveMeetingDialog trigger={currentMeetingNavItem} />
              )}
              <SidebarNavItem
                icon={<ListChecks className="size-5" strokeWidth={2} />}
                label="회의 목록"
              />
            </nav>

            <div className="mt-auto flex justify-end">
              <SidebarMoreMenu />
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
