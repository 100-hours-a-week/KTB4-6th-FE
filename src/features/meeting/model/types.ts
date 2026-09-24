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
