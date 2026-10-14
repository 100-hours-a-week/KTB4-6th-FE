'use client';

import { useRef } from 'react';
import { Popover } from '@base-ui/react/popover';
import { Info } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';
import { DASHBOARD_INFO, type DashboardInfoKey } from '../model/dashboard-info';

interface DashboardInfoPopoverProps {
  infoKey: DashboardInfoKey;
}

export const DashboardInfoPopover = ({ infoKey }: DashboardInfoPopoverProps) => {
  const frame = useAppFrameElement();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { label, descriptionLines } = DASHBOARD_INFO[infoKey];

  return (
    <Popover.Root>
      <Popover.Trigger
        ref={triggerRef}
        aria-label={`${label} 설명`}
        className="-my-1.5 flex size-7 shrink-0 items-center justify-center rounded-[7px] text-cool-400 transition-colors hover:bg-cool-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 data-[popup-open]:bg-cool-100"
      >
        <Info aria-hidden="true" className="size-3.5" strokeWidth={2} />
      </Popover.Trigger>

      <Popover.Portal container={frame}>
        <Popover.Positioner
          className="z-[75] outline-none"
          side="bottom"
          align="start"
          sideOffset={6}
          alignOffset={({ positioner }) => {
            const frameRect = frame?.getBoundingClientRect();
            const triggerRect = triggerRef.current?.getBoundingClientRect();

            if (!frameRect || !triggerRect) return 0;

            const centeredLeft = frameRect.left + (frameRect.width - positioner.width) / 2;

            return centeredLeft - triggerRect.left;
          }}
          collisionBoundary={frame ?? undefined}
          collisionPadding={20}
        >
          <Popover.Popup className="w-[322px] max-w-[calc(100vw-2.5rem)] rounded-[11px] bg-cool-900 px-3.5 py-3 shadow-[0_12px_28px_rgba(22,30,43,0.22)] outline-none">
            <Popover.Arrow className="size-3 rotate-45 rounded-[2px] bg-cool-900 data-[side=bottom]:-top-1.5 data-[side=left]:-right-1.5 data-[side=right]:-left-1.5 data-[side=top]:-bottom-1.5" />
            <Popover.Description className="text-left text-[13px] leading-[1.6] break-keep text-cool-200">
              {descriptionLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </Popover.Description>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};
