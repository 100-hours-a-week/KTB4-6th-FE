interface ApiErrorPayload {
  code: string;
  message: string;
}

export interface DashboardTopicData {
  name: string;
  durationSeconds: number;
}

export interface DashboardSummaryData {
  totalMeetings: number;
  totalMeetingDurationSeconds: number;
  averageMeetingDurationSeconds: number;
  overtimeMeetings: number;
  overtimeMeetingRate: number;
  totalContextOutSeconds: number;
  contextOutRate: number;
}

export interface DashboardMeetingData {
  meetingId: number;
  title: string;
  targetDurationSeconds: number;
  actualDurationSeconds: number;
}

export interface DashboardChartPointData {
  startDate: string;
  endDate: string;
  meetingCount: number;
  targetDurationSeconds: number;
  actualDurationSeconds: number;
  overtimeMeetings: number;
}

export interface DashboardData {
  periodDays: number;
  startDate: string;
  endDate: string;
  summary: DashboardSummaryData;
  chart: DashboardChartPointData[];
  meetings: DashboardMeetingData[];
  topics: DashboardTopicData[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData | null;
  error: ApiErrorPayload | null;
}
