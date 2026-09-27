import { FileText } from 'lucide-react';
import type { Meeting } from '../model/type';

interface MeetingItemProps {
  meeting: Meeting;
}

export const MeetingItem = ({ meeting }: MeetingItemProps) => (
  <div className="flex w-full items-center gap-3 rounded-2xl border border-cool-100 bg-white px-4 py-3.5">
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cool-50 text-cool-400"
    >
      <FileText className="size-4" strokeWidth={2} />
    </span>

    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="truncate text-[15px] font-semibold text-cool-900">{meeting.title}</span>
      <span className="truncate text-xs text-cool-500">{meeting.startedAtLabel}</span>
    </span>

    {meeting.durationLabel ? (
      <span className="shrink-0 text-sm font-medium text-cool-600">{meeting.durationLabel}</span>
    ) : null}
  </div>
);
