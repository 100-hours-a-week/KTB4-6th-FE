export interface ApiErrorPayload {
  code: string;
  message: string;
}

export type MeetingListItemStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';

export interface MeetingListItemData {
  meetingId: number;
  title: string;
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
  targetDurationMinutes: number;
  status: MeetingListItemStatus;
}

export interface MeetingListGroupData {
  date: string;
  meetingCount: number;
  meetings: MeetingListItemData[];
}

export interface MeetingListData {
  groups: MeetingListGroupData[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface MeetingListResponse {
  success: boolean;
  data: MeetingListData | null;
  error: ApiErrorPayload | null;
}
