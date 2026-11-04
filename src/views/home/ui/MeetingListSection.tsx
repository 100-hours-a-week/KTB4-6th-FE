import { MeetingListItem } from './MeetingListItem';
import type { Meeting } from '../model/types';

interface MeetingListSectionProps {
  meetings: Meeting[];
  teamId: number;
}

export const MeetingListSection = ({ meetings, teamId }: MeetingListSectionProps) => (
  <section className="mt-6 flex min-h-0 flex-1 flex-col">
    <div className="flex items-center justify-between px-5">
      <h2 className="text-base font-bold text-cool-900">오늘 회의 목록</h2>
      <span className="text-sm text-cool-500">{meetings.length}건</span>
    </div>

    <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-5 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {meetings.length === 0 ? (
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:animation-duration-300 flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-cool-200 bg-white px-4 text-center">
          <p className="text-sm font-semibold text-cool-700">오늘 회의가 없어요.</p>
          <p className="mt-1 text-sm text-cool-500">새 회의를 만들어 시작해보세요.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {meetings.map((meeting) => (
            <MeetingListItem key={meeting.id} meeting={meeting} teamId={teamId} />
          ))}
        </div>
      )}
    </div>
  </section>
);
