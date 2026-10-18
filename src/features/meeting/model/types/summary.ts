import type { ApiResponse } from './common';

export interface MeetingSummaryData {
  summaryId: number;
  content: string | null;
  version: number;
  status: string;
  createdAt: string;
}

export type MeetingSummaryResponse = ApiResponse<MeetingSummaryData>;

export interface RequestMeetingSummaryRequest {
  reason: string;
}

export interface MeetingSummaryRequestData {
  summaryId: number;
  version: number;
  status: string;
  creditBalance: number;
}

export type MeetingSummaryRequestResponse = ApiResponse<MeetingSummaryRequestData>;
