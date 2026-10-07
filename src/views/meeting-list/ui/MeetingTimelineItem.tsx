import Link from 'next/link';
import { cn } from '@/shared/lib';
import { Badge } from '@/shared/ui';
import { MEETING_STATUS_BADGE } from '../model/meeting-status-badge';
import type { Meeting } from '../model/type';
import { MeetingItemMenu } from './MeetingItemMenu';

interface MeetingTimelineItemProps {
  meeting: Meeting;
  teamId: number;
  onRename?: () => void;
  onDelete?: () => void;
}

export const MeetingTimelineItem = ({
  meeting,
  teamId,
  onRename,
  onDelete,
}: MeetingTimelineItemProps) => {
  const badge = MEETING_STATUS_BADGE[meeting.status];
  const isCompleted = meeting.status === 'completed';

  return (
    <li className="relative pb-3 pl-5 last:pb-0">
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-3 bottom-0 left-1 border-l-2 border-brand-200',
          !isCompleted && 'border-dashed',
        )}
      />
      {/* 점 둘레를 배경색으로 감싸 선이 점에서 끊겨 보이게 한다. 종료 전 회의는 속이 빈 원으로 그린다. */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-[7px] left-0 size-[11px] rounded-full',
          isCompleted
            ? 'bg-brand-400 shadow-[0_0_0_3px_var(--color-cool-50)]'
            : 'bg-white shadow-[inset_0_0_0_2px_var(--color-brand-400),0_0_0_3px_var(--color-cool-50)]',
        )}
      />

      <span
        className={cn(
          'block text-[15px] leading-[25px] font-semibold tabular-nums',
          meeting.status === 'scheduled' ? 'text-brand-600' : 'text-cool-900',
        )}
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

        {onRename && onDelete && (
          <div className="relative z-10">
            <MeetingItemMenu meetingTitle={meeting.title} onRename={onRename} onDelete={onDelete} />
          </div>
        )}
      </div>
    </li>
  );
};
