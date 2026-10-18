import { Badge } from '@/shared/ui';
import type { Meeting, MeetingMenuActions, TodayMeetings } from '../model/type';
import { InProgressMeetingCard } from './InProgressMeetingCard';
import { MeetingTimelineItem } from './MeetingTimelineItem';

interface TodayMeetingSectionProps {
  today: TodayMeetings;
  teamId: number;
  getMenuActions: (meeting: Meeting) => MeetingMenuActions;
}

export const TodayMeetingSection = ({
  today,
  teamId,
  getMenuActions,
}: TodayMeetingSectionProps) => {
  const { inProgressMeeting, otherMeetings } = today;

  return (
    <section className="rounded-2xl border border-brand-200 bg-brand-100 p-4">
      <h3 className="flex items-center gap-2">
        <Badge
          variant="brandSolid"
          className="rounded px-1.5 py-1 text-[11.5px] leading-none font-semibold"
        >
          오늘
        </Badge>
        <span className="text-base font-bold text-brand-800">{today.label}</span>
        <span className="text-[13px] text-cool-500">회의 {today.meetingCount}개</span>
      </h3>

      {inProgressMeeting && (
        <div className="mt-3.5">
          <InProgressMeetingCard
            meeting={inProgressMeeting}
            teamId={teamId}
            menuActions={getMenuActions(inProgressMeeting)}
          />
        </div>
      )}

      {otherMeetings.length > 0 && (
        <>
          {inProgressMeeting && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[13px] font-medium text-cool-500">오늘의 다른 회의</span>
              <span aria-hidden="true" className="h-px flex-1 bg-brand-200" />
            </div>
          )}
          <ol className="mt-3">
            {otherMeetings.map((meeting) => (
              <MeetingTimelineItem
                key={meeting.id}
                meeting={meeting}
                teamId={teamId}
                tone="today"
                menuActions={getMenuActions(meeting)}
              />
            ))}
          </ol>
        </>
      )}
    </section>
  );
};
