'use client';

import { Menu } from '@base-ui/react/menu';
import { MoreVertical } from 'lucide-react';
import { cn, useAppFrameElement } from '@/shared/lib';

interface MeetingMoreMenuProps {
  canDelete: boolean;
  canEditInfo: boolean;
  isMeetingInProgress: boolean;
  isDeleting: boolean;
  isRecorder: boolean;
  onDelete: () => void;
  onEditInfo: () => void;
}

export const MeetingMoreMenu = ({
  canDelete,
  canEditInfo,
  isMeetingInProgress,
  isDeleting,
  isRecorder,
  onDelete,
  onEditInfo,
}: MeetingMoreMenuProps) => {
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
              isRecorder || canDelete ? 'min-w-[190px]' : 'min-w-[152px]',
            )}
          >
            {(canEditInfo || isMeetingInProgress) && (
              <Menu.Item
                disabled={isMeetingInProgress}
                onClick={onEditInfo}
                className={cn(
                  'flex min-h-12 items-center px-4 py-3 text-sm font-medium outline-none select-none',
                  isMeetingInProgress ? 'text-cool-400' : 'text-cool-900',
                )}
              >
                회의 정보 수정
              </Menu.Item>
            )}
            {canDelete && (
              <Menu.Item
                disabled={isDeleting || isMeetingInProgress}
                onClick={onDelete}
                className={cn(
                  'flex min-h-12 items-center border-t border-cool-100 px-4 py-3 text-sm font-medium outline-none select-none',
                  isMeetingInProgress ? 'text-cool-400' : 'text-danger',
                )}
              >
                {isDeleting ? '삭제 중...' : '회의 삭제'}
              </Menu.Item>
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};
