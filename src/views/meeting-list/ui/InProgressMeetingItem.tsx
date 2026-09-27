import { Badge } from '@/shared/ui';
import type { Meeting } from '../model/type';

interface InProgressMeetingItemProps {
  meeting: Meeting;
}

export const InProgressMeetingItem = ({ meeting }: InProgressMeetingItemProps) => (
  <div className="flex w-full items-center gap-3 rounded-2xl border border-l-4 border-cool-100 border-l-danger bg-white px-4 py-3.5">
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-danger-bg"
    >
      <span className="size-2.5 rounded-full bg-danger/60" />
    </span>

    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="flex items-center gap-1.5">
        <span className="truncate text-[15px] font-semibold text-cool-900">{meeting.title}</span>
        <Badge variant="danger">진행 중</Badge>
      </span>
      <span className="truncate text-xs text-cool-500">{meeting.startedAtLabel}</span>
    </span>
  </div>
);
