import { cn } from '@/shared/lib';
import type { Meeting, MeetingMenuActions } from '../model/type';
import { MeetingCard } from './MeetingCard';

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

      <MeetingCard className="mt-2" meeting={meeting} teamId={teamId} menuActions={menuActions} />
    </li>
  );
};
