'use client';

import { Popover } from '@base-ui/react/popover';
import { MoreVertical } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';

/** 진행 중인 회의에서 진행자가 아닌 참여자에게 더보기 대신 관리 권한 안내를 보여준다. */
export const MeetingManageNotice = () => {
  const frame = useAppFrameElement();

  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label="더 보기"
        className="flex size-9 items-center justify-center rounded-full text-cool-600 transition-colors hover:bg-cool-100"
      >
        <MoreVertical className="size-5" strokeWidth={2} />
      </Popover.Trigger>
      <Popover.Portal container={frame}>
        <Popover.Positioner className="z-[75] outline-none" side="top" align="end" sideOffset={6}>
          <Popover.Popup className="w-[200px] rounded-xl border border-cool-100 bg-white px-4 py-3.5 text-sm leading-5 text-cool-500 shadow-[0_8px_24px_rgba(20,34,56,0.12)] outline-none">
            회의 진행자만 회의 정보를 관리할 수 있습니다.
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};
