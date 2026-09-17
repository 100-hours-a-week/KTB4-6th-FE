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

    {meetings.length === 0 ? (
      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:animation-duration-300 mt-3 flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-cool-200 bg-white px-4 text-center">
        <p className="text-sm font-semibold text-cool-700">오늘 회의가 없어요.</p>
        <p className="mt-1 text-sm text-cool-500">새 회의를 만들어 시작해보세요.</p>
      </div>
    ) : (
      <>
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
      </>
    )}
  </section>
);
