import type { HomeData, HomeMeetingStatus, HomeTodayMeetingData } from '@/features/home';
import type { Meeting, MeetingStatus, TeamSummary } from './types';

const MEETING_STATUS_BY_API_STATUS: Record<HomeMeetingStatus, MeetingStatus> = {
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

// API 시각은 'YYYY-MM-DDTHH:mm:ss' 형식이라 시간대 변환 없이 'HH:mm'만 잘라낸다.
const formatTime = (dateTime: string) => dateTime.slice(11, 16);

const getDurationLabel = (startedAt: string | null, endedAt: string | null) => {
  if (!startedAt || !endedAt) return '';

  const durationMs = new Date(endedAt).getTime() - new Date(startedAt).getTime();

  return formatMinutes(Math.max(0, Math.round(durationMs / 60000)));
};

const toMeeting = (meeting: HomeTodayMeetingData): Meeting => {
  const startTime = formatTime(meeting.startedAt ?? meeting.scheduledAt);

  return {
    id: String(meeting.meetingId),
    title: meeting.title,
    status: MEETING_STATUS_BY_API_STATUS[meeting.status],
    scheduledAtLabel: `${startTime} 시작`,
    dateLabel: `오늘 ${startTime}`,
    durationLabel: getDurationLabel(meeting.startedAt, meeting.endedAt),
  };
};

export const toHomeViewModel = (home: HomeData) => {
  const team: TeamSummary = {
    name: home.team.name,
    memberCount: home.team.memberCount,
    inviteCode: home.team.invitationCode,
    totalMeetingCount: home.meetingSummary.totalMeetingCount,
    totalDurationLabel: formatMinutes(home.meetingSummary.totalMeetingMinutes),
  };

  return { team, meetings: home.todayMeetings.map(toMeeting) };
};
