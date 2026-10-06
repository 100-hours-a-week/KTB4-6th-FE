import Link from 'next/link';
import { Badge } from '@/shared/ui';
import type { Meeting } from '../model/type';
import { MeetingItemMenu } from './MeetingItemMenu';

interface InProgressMeetingItemProps {
  meeting: Meeting;
  teamId: number;
  onRename?: () => void;
  onDelete?: () => void;
}

// 제목 링크의 ::after가 카드 전체를 덮어 카드 어디를 눌러도 이동하고, ⋯ 메뉴는 그 위에 따로 올려 둔다.
export const InProgressMeetingItem = ({
  meeting,
  teamId,
  onRename,
  onDelete,
}: InProgressMeetingItemProps) => (
  <div className="relative flex w-full items-center gap-3 rounded-2xl border border-l-4 border-cool-100 border-l-danger bg-white px-4 py-3.5 transition-colors hover:bg-danger-bg/40">
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-danger-bg"
    >
      <span className="size-2.5 rounded-full bg-danger/60" />
    </span>

    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="flex items-center gap-1.5">
        <Link
          href={`/teams/${teamId}/meetings/${meeting.id}`}
          className="truncate text-[15px] font-semibold text-cool-900 outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-brand-600"
        >
          {meeting.title}
        </Link>
        <Badge variant="danger">진행 중</Badge>
      </span>
      <span className="truncate text-xs text-cool-500">{meeting.time} 시작</span>
    </span>

    {onRename && onDelete && (
      <div className="relative z-10">
        <MeetingItemMenu meetingTitle={meeting.title} onRename={onRename} onDelete={onDelete} />
      </div>
    )}
  </div>
);
