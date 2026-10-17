interface ApiErrorPayload {
  code: string;
  message: string;
}

export interface DashboardSummaryData {
  totalMeetings: number;
  totalMeetingDurationSeconds: number;
  averageMeetingDurationSeconds: number;
  overtimeMeetings: number;
  overtimeMeetingRate: number;
  overtimeDurationRate: number;
  totalContextOutSeconds: number;
  contextOutRate: number;
}

export interface DashboardChartPointData {
  startDate: string;
  endDate: string;
  targetDurationSeconds: number;
  actualDurationSeconds: number;
}

export interface DashboardTopicData {
  name: string;
  durationSeconds: number;
}

export interface DashboardData {
  periodDays: number;
  startDate: string;
  endDate: string;
  summary: DashboardSummaryData;
  chart: DashboardChartPointData[];
  topics: DashboardTopicData[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData | null;
  error: ApiErrorPayload | null;
}
