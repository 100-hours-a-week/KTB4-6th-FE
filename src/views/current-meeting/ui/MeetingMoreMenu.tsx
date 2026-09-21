'use client';

import { Menu } from '@base-ui/react/menu';
import { LogOut, MoreVertical } from 'lucide-react';
import { cn, useAppFrameElement } from '@/shared/lib';

interface MeetingMoreMenuProps {
  isRecorder: boolean;
}

export const MeetingMoreMenu = ({ isRecorder }: MeetingMoreMenuProps) => {
  const frame = useAppFrameElement();

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="더 보기"
        className="flex size-9 items-center justify-center rounded-full text-cool-600 transition-colors hover:bg-cool-100"
      >
        <MoreVertical className="size-5" strokeWidth={2} />
      </Menu.Trigger>
      <Menu.Portal container={frame}>
        <Menu.Positioner className="z-[75] outline-none" side="top" align="end" sideOffset={6}>
          <Menu.Popup
            className={cn(
              'rounded-xl border border-cool-100 bg-white py-1 shadow-[0_8px_24px_rgba(20,34,56,0.12)] outline-none',
              isRecorder ? 'min-w-[190px]' : 'min-w-[152px]',
            )}
          >
            {isRecorder ? (
              <>
                <Menu.Item
                  disabled
                  className="flex min-h-12 items-center px-4 py-3 text-sm font-medium text-cool-900 outline-none select-none"
                >
                  회의 이름 변경
                </Menu.Item>
                <Menu.Item
                  disabled
                  className="flex min-h-12 items-center border-t border-cool-100 px-4 py-3 text-sm font-medium text-cool-400 outline-none select-none"
                >
                  회의 삭제
                </Menu.Item>
              </>
            ) : (
              <Menu.Item
                disabled
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-cool-400 outline-none select-none"
              >
                <LogOut className="size-4" strokeWidth={2} />
                회의 나가기
              </Menu.Item>
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};
