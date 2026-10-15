'use client';

import { Drawer } from '@base-ui/react/drawer';
import { X } from 'lucide-react';
import type { MeetingAttendeeData } from '@/entities/meeting-attendee';
import { useAppFrameElement } from '@/shared/lib';

interface MeetingAttendeesSheetProps {
  isOpen: boolean;
  meetingTitle: string;
  attendees: MeetingAttendeeData[];
  onOpenChange: (open: boolean) => void;
}

export const MeetingAttendeesSheet = ({
  isOpen,
  meetingTitle,
  attendees,
  onOpenChange,
}: MeetingAttendeesSheetProps) => {
  const frame = useAppFrameElement();

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange} swipeDirection="down">
      <Drawer.Portal container={frame}>
        <Drawer.Backdrop className="absolute inset-0 z-[60] bg-cool-900/40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />

        <Drawer.Viewport className="absolute inset-0 z-[60] flex items-end">
          <Drawer.Popup className="flex max-h-[80%] w-full flex-col rounded-t-[28px] bg-white px-6 pt-3 pb-8 shadow-[0_-8px_24px_rgba(20,34,56,0.12)] transition-transform duration-200 ease-out [transform:translateY(var(--drawer-swipe-movement-y))] data-ending-style:translate-y-full data-starting-style:translate-y-full">
            <span
              aria-hidden="true"
              className="mx-auto h-1 w-10 shrink-0 rounded-full bg-cool-200"
            />

            <div className="mt-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Drawer.Title className="text-xl font-bold text-cool-900">
                  참여자 <span className="text-brand-600">{attendees.length}</span>
                </Drawer.Title>
                <Drawer.Description
                  data-clarity-mask="true"
                  className="mt-1.5 truncate text-sm text-cool-500"
                >
                  {meetingTitle}
                </Drawer.Description>
              </div>
              <Drawer.Close
                aria-label="참여자 목록 닫기"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cool-100 text-cool-600 transition-colors hover:bg-cool-200"
              >
                <X className="size-5" strokeWidth={2} />
              </Drawer.Close>
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
