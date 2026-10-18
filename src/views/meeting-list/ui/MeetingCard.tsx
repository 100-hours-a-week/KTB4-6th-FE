import Link from 'next/link';
import { cn } from '@/shared/lib';
import { Badge } from '@/shared/ui';
import { MEETING_STATUS_BADGE } from '../model/meeting-status-badge';
import type { Meeting, MeetingMenuActions } from '../model/type';
import { MeetingItemMenu } from './MeetingItemMenu';

interface MeetingCardProps {
  meeting: Meeting;
  teamId: number;
  menuActions: MeetingMenuActions;
  subLabel?: string;
  className?: string;
}

export const MeetingCard = ({
  meeting,
  teamId,
  menuActions,
  subLabel = meeting.subLabel,
  className,
}: MeetingCardProps) => {
  const badge = MEETING_STATUS_BADGE[meeting.status];

  return (
    <div
      className={cn(
        'relative flex items-center gap-1 rounded-xl border border-cool-200 bg-white py-3.5 pr-1 pl-4 transition-colors hover:border-brand-200',
        className,
      )}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex min-w-0 items-center gap-1.5">
          <Link
            href={`/teams/${teamId}/meetings/${meeting.id}`}
            className="truncate text-base font-semibold text-cool-900 outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-brand-600"
          >
            {meeting.title}
          </Link>
          <Badge
            variant={badge.variant}
            className="rounded px-1.5 py-1 text-[11.5px] leading-none font-semibold"
          >
            {badge.label}
          </Badge>
        </span>
        {subLabel && <span className="truncate text-[13px] text-cool-500">{subLabel}</span>}
      </span>

      {menuActions.state.isVisible && (
        <div className="relative z-10">
          <MeetingItemMenu meetingTitle={meeting.title} menuActions={menuActions} />
        </div>
      )}
    </div>
  );
};
