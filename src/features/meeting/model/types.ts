export interface ApiErrorPayload {
  code: string;
  message: string;
}

export interface CreateMeetingRequest {
  title: string;
  purpose: string;
  note: string;
  targetDurationMinutes: number;
}

export interface CreateMeetingData {
  meetingId: number;
  teamId: number;
  createdByTeamMemberId: number;
  title: string;
  purpose: string;
  note: string;
  scheduledAt: string;
  targetDurationMinutes: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
}

export interface CreateMeetingResponse {
  success: boolean;
  data: CreateMeetingData | null;
  error: ApiErrorPayload | null;
}

export interface MeetingSummaryData {
  summaryId: number;
  /** 요약 본문(Markdown). 생성 중이거나 실패했으면 null */
  content: string | null;
  /** 재생성 회차 */
  version: number;
  /** 생성 상태. 알려진 값은 COMPLETED, FAILED이고 그 외는 생성 중으로 본다 */
  status: string;
  createdAt: string;
}

export interface MeetingSummaryResponse {
  success: boolean;
  data: MeetingSummaryData | null;
  error: ApiErrorPayload | null;
}
