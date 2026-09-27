'use client';

import type { ReactNode } from 'react';
import { Menu } from '@base-ui/react/menu';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { cn, useAppFrameElement } from '@/shared/lib';

interface MeetingItemMenuProps {
  meetingTitle: string;
  onRename: () => void;
  onDelete: () => void;
}

interface MenuItemProps {
  icon: ReactNode;
  label: string;
  isDanger?: boolean;
  onClick: () => void;
}

const MenuItem = ({ icon, label, isDanger, onClick }: MenuItemProps) => (
  <Menu.Item
    onClick={onClick}
    className={cn(
      'flex min-h-12 items-center gap-3 border-t border-cool-100 px-4 py-3 text-sm font-medium outline-none select-none first:border-t-0',
      isDanger ? 'text-danger' : 'text-cool-900',
    )}
  >
    <span aria-hidden="true" className={cn('shrink-0', isDanger ? 'text-danger' : 'text-cool-500')}>
      {icon}
    </span>
    {label}
  </Menu.Item>
);

/** 회의 항목 오른쪽의 ⋯ 메뉴. 어떤 동작을 할지는 부모가 콜백으로 정한다. */
export const MeetingItemMenu = ({ meetingTitle, onRename, onDelete }: MeetingItemMenuProps) => {
  const frame = useAppFrameElement();

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`${meetingTitle} 더 보기`}
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-cool-500 transition-colors hover:bg-cool-100"
      >
        <Ellipsis className="size-5" strokeWidth={2} />
      </Menu.Trigger>
      <Menu.Portal container={frame}>
        <Menu.Positioner className="z-[75] outline-none" side="bottom" align="end" sideOffset={6}>
          <Menu.Popup className="min-w-[180px] rounded-xl border border-cool-100 bg-white shadow-[0_8px_24px_rgba(20,34,56,0.12)] outline-none">
            <MenuItem
              icon={<Pencil className="size-4" strokeWidth={2} />}
              label="회의 이름 변경"
              onClick={onRename}
            />
            <MenuItem
              icon={<Trash2 className="size-4" strokeWidth={2} />}
              label="회의 삭제"
              isDanger
              onClick={onDelete}
            />
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};
