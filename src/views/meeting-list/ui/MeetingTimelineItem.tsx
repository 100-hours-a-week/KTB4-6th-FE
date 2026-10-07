import Link from 'next/link';
import { cn } from '@/shared/lib';
import { Badge } from '@/shared/ui';
import { MEETING_STATUS_BADGE } from '../model/meeting-status-badge';
import type { Meeting, MeetingMenuActions } from '../model/type';
import { MeetingItemMenu } from './MeetingItemMenu';

interface MeetingTimelineItemProps {
  meeting: Meeting;
  teamId: number;
  tone?: 'default' | 'today';
  menuActions: MeetingMenuActions;
}

interface TimelineStyle {
  line: string;
  dot: string;
  time: string;
}

const OPEN_DOT = {
  default:
    'bg-white shadow-[inset_0_0_0_2px_var(--color-brand-400),0_0_0_3px_var(--color-cool-50)]',
  today:
    'bg-white shadow-[inset_0_0_0_2px_var(--color-brand-400),0_0_0_3px_var(--color-brand-100)]',
};

const TIMELINE_STYLE: Record<'default' | 'today', Record<Meeting['status'], TimelineStyle>> = {
  default: {
    completed: {
      line: 'border-brand-200',
      dot: 'bg-brand-400 shadow-[0_0_0_3px_var(--color-cool-50)]',
      time: 'text-cool-900',
    },
    scheduled: {
      line: 'border-dashed border-brand-200',
      dot: OPEN_DOT.default,
      time: 'text-brand-600',
    },
    waiting: {
      line: 'border-dashed border-brand-200',
      dot: OPEN_DOT.default,
      time: 'text-cool-900',
    },
    in_progress: {
      line: 'border-dashed border-brand-200',
      dot: OPEN_DOT.default,
      time: 'text-cool-900',
    },
  },
  today: {
    completed: {
      line: 'border-brand-500',
      dot: 'bg-brand-600 shadow-[0_0_0_3px_var(--color-brand-100)]',
      time: 'text-cool-900',
    },
    scheduled: {
      line: 'border-dashed border-brand-300',
      dot: OPEN_DOT.today,
      time: 'text-brand-600',
    },
    waiting: {
      line: 'border-dashed border-warning/60',
      dot: 'bg-white shadow-[inset_0_0_0_2px_var(--color-warning),0_0_0_3px_var(--color-brand-100)]',
      time: 'text-warning',
    },
    in_progress: {
      line: 'border-dashed border-brand-300',
      dot: OPEN_DOT.today,
      time: 'text-cool-900',
    },
  },
};

export const MeetingTimelineItem = ({
  meeting,
  teamId,
  tone = 'default',
  menuActions,
}: MeetingTimelineItemProps) => {
  const badge = MEETING_STATUS_BADGE[meeting.status];
  const style = TIMELINE_STYLE[tone][meeting.status];

  return (
    <li className="relative pb-3 pl-5 last:pb-0">
      <span
        aria-hidden="true"
        className={cn('absolute top-3 bottom-0 left-1 border-l-2', style.line)}
      />
      <span
        aria-hidden="true"
        className={cn('absolute top-[7px] left-0 size-[11px] rounded-full', style.dot)}
      />

      <span
        className={cn('block text-[15px] leading-[25px] font-semibold tabular-nums', style.time)}
      >
        {meeting.time}
      </span>

      <div className="relative mt-2 flex items-center gap-1 rounded-xl border border-cool-200 bg-white py-3.5 pr-1 pl-4 transition-colors hover:border-brand-200">
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
          {meeting.subLabel && (
            <span className="truncate text-[13px] text-cool-500">{meeting.subLabel}</span>
          )}
        </span>

        {menuActions.state.isVisible && (
          <div className="relative z-10">
            <MeetingItemMenu meetingTitle={meeting.title} menuActions={menuActions} />
          </div>
        )}
      </div>
    </li>
  );
};
