'use client';

import { Menu } from '@base-ui/react/menu';
import { Ellipsis, Lock } from 'lucide-react';
import { cn, useAppFrameElement } from '@/shared/lib';
import { useAppToast } from '@/shared/ui';
import type { MeetingMenuActions, MeetingMenuItemState } from '../model/type';

interface MeetingItemMenuProps {
  meetingTitle: string;
  menuActions: MeetingMenuActions;
  triggerClassName?: string;
}

const EDIT_LOCKED_MESSAGE = '진행 중인 회의는 수정할 수 없습니다.';
const DELETE_LOCKED_MESSAGE = '진행 중인 회의는 삭제할 수 없습니다.';

interface MenuItemProps {
  label: string;
  state: Exclude<MeetingMenuItemState, 'hidden'>;
  isDanger?: boolean;
  onClick?: () => void;
  onLocked: () => void;
}

const MenuItem = ({ label, state, isDanger, onClick, onLocked }: MenuItemProps) => {
  const isLocked = state === 'locked';
  const isUnavailable = !isLocked && !onClick;

  return (
    <Menu.Item
      aria-disabled={isLocked || isUnavailable}
      onClick={() => {
        if (isLocked) {
          onLocked();
          return;
        }

        onClick?.();
      }}
      className={cn(
        'flex min-h-12 items-center justify-between gap-3 border-t border-cool-100 px-4 py-3 text-sm font-medium outline-none select-none first:border-t-0',
        isLocked || isUnavailable ? 'text-cool-400' : isDanger ? 'text-danger' : 'text-cool-900',
      )}
    >
      {label}
      {isLocked && <Lock aria-hidden="true" className="size-4 shrink-0" strokeWidth={2} />}
    </Menu.Item>
  );
};

export const MeetingItemMenu = ({
  meetingTitle,
  menuActions,
  triggerClassName,
}: MeetingItemMenuProps) => {
  const frame = useAppFrameElement();
  const { showToast } = useAppToast();
  const { state, onEditInfo, onRename, onDelete } = menuActions;

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`${meetingTitle} 더 보기`}
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full text-cool-500 transition-colors hover:bg-cool-100',
          triggerClassName,
        )}
      >
        <Ellipsis className="size-5" strokeWidth={2} />
      </Menu.Trigger>
      <Menu.Portal container={frame}>
        <Menu.Positioner className="z-[75] outline-none" side="bottom" align="end" sideOffset={6}>
          <Menu.Popup className="min-w-[180px] rounded-xl border border-cool-100 bg-white shadow-[0_8px_24px_rgba(20,34,56,0.12)] outline-none">
            {state.editInfo !== 'hidden' && (
              <MenuItem
                label="회의 정보 수정"
                state={state.editInfo}
                onClick={onEditInfo}
                onLocked={() => showToast(EDIT_LOCKED_MESSAGE, 'warning')}
              />
            )}
            {state.rename !== 'hidden' && (
              <MenuItem
                label="회의 이름 변경"
                state={state.rename}
                onClick={onRename}
                onLocked={() => showToast(EDIT_LOCKED_MESSAGE, 'warning')}
              />
            )}
            {state.delete !== 'hidden' && (
              <MenuItem
                label="삭제"
                state={state.delete}
                isDanger
                onClick={onDelete}
                onLocked={() => showToast(DELETE_LOCKED_MESSAGE, 'warning')}
              />
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};
