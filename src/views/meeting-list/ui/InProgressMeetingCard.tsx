import Link from 'next/link';
import type { Meeting, MeetingMenuActions } from '../model/type';
import { MeetingItemMenu } from './MeetingItemMenu';

interface InProgressMeetingCardProps {
  meeting: Meeting;
  teamId: number;
  menuActions: MeetingMenuActions;
}

export const InProgressMeetingCard = ({
  meeting,
  teamId,
  menuActions,
}: InProgressMeetingCardProps) => (
  <div className="relative flex items-start gap-2 rounded-2xl bg-danger py-4 pr-2 pl-5 text-white">
    <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
      <span className="flex items-center gap-1.5 text-[13px] font-semibold">
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-white/70" />
        진행 중
      </span>
      <Link
        href={`/teams/${teamId}/meetings/${meeting.id}`}
        className="truncate text-lg font-bold outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-white"
      >
        {meeting.title}
      </Link>
      <span className="truncate text-sm text-white/80">
        {meeting.time} 시작{meeting.subLabel && ` · ${meeting.subLabel}`}
      </span>
    </div>

    {menuActions.state.isVisible && (
      <div className="relative z-10">
        <MeetingItemMenu
          meetingTitle={meeting.title}
          menuActions={menuActions}
          triggerClassName="text-white hover:bg-white/15"
        />
      </div>
    )}
  </div>
);
