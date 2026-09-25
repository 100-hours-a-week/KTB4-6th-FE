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

export interface RequestMeetingSummaryRequest {
  /** 요약을 다시 만드는 사유 */
  reason: string;
}

export interface MeetingSummaryRequestData {
  summaryId: number;
  /** 이 회의의 요약 회차 */
  version: number;
  status: string;
  /** 요청으로 크레딧이 차감된 뒤의 팀 크레딧 잔액 */
  creditBalance: number;
}

export interface MeetingSummaryRequestResponse {
  success: boolean;
  data: MeetingSummaryRequestData | null;
  error: ApiErrorPayload | null;
}
