import type {
  MeetingListData,
  MeetingListItemData,
  MeetingListItemStatus,
} from '@/features/meeting-list';
import type { Meeting } from './type';

const MEETING_STATUS_BY_API_STATUS: Record<MeetingListItemStatus, Meeting['status']> = {
  SCHEDULED: 'scheduled',
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

const formatMinutes = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}분`;
  if (minutes === 0) return `${hours}시간`;

  return `${hours}시간 ${minutes}분`;
};

const formatDate = (dateTime: string) => dateTime.slice(0, 10).replaceAll('-', '.');
const formatTime = (dateTime: string) => dateTime.slice(11, 16);

const getStartedAtLabel = (meeting: MeetingListItemData) => {
  const startAt =
    meeting.status === 'WAITING' ? meeting.scheduledAt : (meeting.startedAt ?? meeting.scheduledAt);
  const date = formatDate(startAt);
  const time = formatTime(startAt);

  return meeting.status === 'IN_PROGRESS' ? `${date} · ${time} 시작` : `${date} ${time}`;
};

const getDurationLabel = (meeting: MeetingListItemData) => {
  if (meeting.status !== 'COMPLETED' || !meeting.startedAt || !meeting.endedAt) return undefined;

  const durationMs = new Date(meeting.endedAt).getTime() - new Date(meeting.startedAt).getTime();

  return formatMinutes(Math.max(0, Math.ceil(durationMs / 60000)));
};

const toMeeting = (meeting: MeetingListItemData): Meeting => ({
  id: meeting.meetingId,
  title: meeting.title,
  status: MEETING_STATUS_BY_API_STATUS[meeting.status],
  startedAtLabel: getStartedAtLabel(meeting),
  durationLabel: getDurationLabel(meeting),
});

export const toMeetings = (pages: MeetingListData[]): Meeting[] =>
  pages.flatMap((page) =>
    page.groups.flatMap((group) => [...group.meetings].reverse().map(toMeeting)),
  );
