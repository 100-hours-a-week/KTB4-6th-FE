export type MeetingStatus = 'in_progress' | 'completed';

export interface Meeting {
  id: string;
  title: string;
  status: MeetingStatus;
  scheduledAtLabel: string;
  dateLabel: string;
  durationLabel: string;
}

export interface TeamSummary {
  name: string;
  memberCount: number;
  inviteCode: string;
  totalMeetingCount: number;
  totalDurationLabel: string;
}
