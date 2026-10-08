import type {
  MeetingListData,
  MeetingListGroupData,
  MeetingListItemData,
  MeetingListItemStatus,
} from '@/features/meeting-list';
import type { Meeting, MeetingDateGroup, TodayMeetings } from './type';

const MEETING_STATUS_BY_API_STATUS: Record<MeetingListItemStatus, Meeting['status']> = {
  SCHEDULED: 'scheduled',
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const formatMinutes = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}분`;
  if (minutes === 0) return `${hours}시간`;

  return `${hours}시간 ${minutes}분`;
};

const formatTime = (dateTime: string) => dateTime.slice(11, 16);

// `2026-10-07` → `2026.10.07`
const formatDate = (date: string) => date.replaceAll('-', '.');

const formatGroupLabel = (date: string) => {
  const [year, month, day] = date.split('-');
  const weekday = WEEKDAYS[new Date(Date.UTC(+year, +month - 1, +day)).getUTCDay()];

  return `${formatDate(date)} (${weekday})`;
};

const getStartAt = (meeting: MeetingListItemData) =>
  meeting.status === 'SCHEDULED' || meeting.status === 'WAITING'
    ? meeting.scheduledAt
    : (meeting.startedAt ?? meeting.scheduledAt);

const getDurationLabel = (meeting: MeetingListItemData) => {
  if (!meeting.startedAt || !meeting.endedAt) return undefined;

  const durationMs = new Date(meeting.endedAt).getTime() - new Date(meeting.startedAt).getTime();

  return formatMinutes(Math.max(0, Math.ceil(durationMs / 60000)));
};

const getSubLabel = (meeting: MeetingListItemData) => {
  if (meeting.status !== 'COMPLETED') {
    return `목표 ${formatMinutes(meeting.targetDurationMinutes)}`;
  }

  const durationLabel = getDurationLabel(meeting);

  return durationLabel && `${durationLabel} 진행`;
};

const toMeeting = (meeting: MeetingListItemData): Meeting => ({
  id: meeting.meetingId,
  createdByTeamMemberId: meeting.createdByTeamMemberId ?? null,
  title: meeting.title,
  status: MEETING_STATUS_BY_API_STATUS[meeting.status],
  time: formatTime(getStartAt(meeting)),
  subLabel: getSubLabel(meeting),
});

const toMeetingDateGroup = (group: MeetingListGroupData): MeetingDateGroup => ({
  date: group.date,
  label: formatGroupLabel(group.date),
  meetingCount: group.meetingCount,
  meetings: group.meetings.map(toMeeting),
});

export const toMeetingDateGroups = (pages: MeetingListData[], today: string): MeetingDateGroup[] =>
  pages.flatMap((page) =>
    page.groups.filter((group) => group.date !== today).map(toMeetingDateGroup),
  );

export const toTodayMeetings = (data: MeetingListData, today: string): TodayMeetings | null => {
  const group = data.groups.find(({ date }) => date === today);
  if (!group || group.meetings.length === 0) return null;

  const meetings = group.meetings.map(toMeeting);

  return {
    label: formatGroupLabel(today),
    meetingCount: group.meetingCount,
    inProgressMeeting: meetings.find(({ status }) => status === 'in_progress'),
    otherMeetings: meetings.filter(({ status }) => status !== 'in_progress'),
  };
};

export const toMeetingSearchResults = (pages: MeetingListData[]): Meeting[] =>
  pages.flatMap((page) =>
    page.groups.flatMap((group) =>
      group.meetings.map(toMeeting).map((meeting) => ({
        ...meeting,
        subLabel: [formatDate(group.date), meeting.time, meeting.subLabel]
          .filter(Boolean)
          .join(' · '),
      })),
    ),
  );
