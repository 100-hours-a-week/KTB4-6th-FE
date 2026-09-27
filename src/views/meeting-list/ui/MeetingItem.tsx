import Link from 'next/link';
import { FileText } from 'lucide-react';
import type { Meeting } from '../model/type';
import { MeetingItemMenu } from './MeetingItemMenu';

interface MeetingItemProps {
  meeting: Meeting;
  teamId: number;
  onRename?: () => void;
  onDelete?: () => void;
}

// 제목 링크의 ::after가 카드 전체를 덮어 카드 어디를 눌러도 이동하고, ⋯ 메뉴는 그 위에 따로 올려 둔다.
export const MeetingItem = ({ meeting, teamId, onRename, onDelete }: MeetingItemProps) => (
  <div className="relative flex w-full items-center gap-3 rounded-2xl border border-cool-100 bg-white px-4 py-3.5 transition-colors hover:bg-cool-50">
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cool-50 text-cool-400"
    >
      <FileText className="size-4" strokeWidth={2} />
    </span>

    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <Link
        href={`/teams/${teamId}/meetings/${meeting.id}`}
        className="truncate text-[15px] font-semibold text-cool-900 outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-brand-600"
      >
        {meeting.title}
      </Link>
      <span className="truncate text-xs text-cool-500">{meeting.startedAtLabel}</span>
    </span>

    {meeting.durationLabel ? (
      <span className="shrink-0 text-sm font-medium text-cool-600">{meeting.durationLabel}</span>
    ) : null}

    {onRename && onDelete && (
      <div className="relative z-10">
        <MeetingItemMenu meetingTitle={meeting.title} onRename={onRename} onDelete={onDelete} />
      </div>
    )}
  </div>
);
