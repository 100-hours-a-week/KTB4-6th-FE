import { MeetingListItem } from './MeetingListItem';
import type { Meeting } from '../model/types';

interface MeetingListSectionProps {
  meetings: Meeting[];
}

export const MeetingListSection = ({ meetings }: MeetingListSectionProps) => (
  <section className="mt-6 flex flex-1 flex-col px-5 pb-8">
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold text-cool-900">오늘 회의 목록</h2>
      <span className="text-sm text-cool-500">{meetings.length}건</span>
    </div>

    <div className="mt-3 flex flex-col gap-2.5">
      {meetings.map((meeting) => (
        <MeetingListItem key={meeting.id} meeting={meeting} />
      ))}
    </div>

    <button
      type="button"
      className="mt-4 flex h-11 items-center justify-center rounded-xl border border-cool-200 text-sm font-medium text-cool-600 transition-colors hover:bg-cool-50"
    >
      더보기
    </button>
  </section>
);
