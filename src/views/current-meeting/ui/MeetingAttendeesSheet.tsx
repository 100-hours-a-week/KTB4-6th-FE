'use client';

import { Drawer } from '@base-ui/react/drawer';
import { X } from 'lucide-react';
import type { MeetingAttendeeData } from '@/entities/meeting-attendee';
import type { TeamMemberData } from '@/features/team-management';
import { cn, useAppFrameElement } from '@/shared/lib';
import { toMeetingAttendeeSheet } from '../model/meeting-attendee-sheet';

interface MeetingAttendeesSheetProps {
  isOpen: boolean;
  meetingTitle: string;
  attendees: MeetingAttendeeData[];
  teamMembers: TeamMemberData[];
  myTeamMemberId: number | null;
  onOpenChange: (open: boolean) => void;
}

export const MeetingAttendeesSheet = ({
  isOpen,
  meetingTitle,
  attendees,
  teamMembers,
  myTeamMemberId,
  onOpenChange,
}: MeetingAttendeesSheetProps) => {
  const frame = useAppFrameElement();
  const { teamAttendees, customAttendees } = toMeetingAttendeeSheet(
    attendees,
    teamMembers,
    myTeamMemberId,
  );

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

            <div className="mt-6 flex min-h-0 flex-col gap-6 overflow-y-auto">
              {teamAttendees.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-cool-700">
                    팀원 {teamAttendees.length}
                  </h3>
                  <ul className="mt-2.5 grid grid-cols-2 gap-2.5">
                    {teamAttendees.map((attendee) => (
                      <li
                        key={attendee.key}
                        className={cn(
                          'flex min-w-0 items-center gap-2.5 rounded-2xl border px-3 py-3',
                          attendee.isMe
                            ? 'border-brand-200 bg-brand-50'
                            : 'border-cool-100 bg-cool-50',
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                            attendee.isMe
                              ? 'bg-brand-600 text-white'
                              : 'bg-brand-100 text-brand-700',
                          )}
                        >
                          {attendee.name.charAt(0)}
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-semibold text-cool-900">
                            {attendee.name}
                          </span>
                          {attendee.caption && (
                            <span className="text-xs text-cool-500">{attendee.caption}</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {customAttendees.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-cool-700">
                    직접 입력 {customAttendees.length}
                  </h3>
                  <ul className="mt-2.5 grid grid-cols-2 gap-2.5">
                    {customAttendees.map((attendee) => (
                      <li
                        key={attendee.key}
                        className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-dashed border-cool-300 bg-white px-3 py-3"
                      >
                        <span
                          aria-hidden="true"
                          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cool-100 text-sm font-semibold text-cool-500"
                        >
                          {attendee.name.charAt(0)}
                        </span>
                        <span className="truncate text-sm font-semibold text-cool-900">
                          {attendee.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
