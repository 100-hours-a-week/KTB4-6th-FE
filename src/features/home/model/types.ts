export interface HomeTeamData {
  teamId: number;
  name: string;
  invitationCode: string;
  memberCount: number;
}

export interface HomeMeetingSummaryData {
  totalMeetingCount: number;
  totalMeetingMinutes: number;
}

export interface HomeMeetingMetricsData {
  averageMeetingMinutes: number | null;
  speechBalanceScore: number | null;
}

export type HomeMeetingStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';

export interface HomeTodayMeetingData {
  meetingId: number;
  title: string;
  status: HomeMeetingStatus;
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
}

export interface HomeData {
  team: HomeTeamData;
  meetingSummary: HomeMeetingSummaryData;
  meetingMetrics: HomeMeetingMetricsData;
  todayMeetingCount: number;
  todayMeetings: HomeTodayMeetingData[];
}

export interface HomeResponse {
  success: boolean;
  data: HomeData | null;
  error: unknown | null;
}
