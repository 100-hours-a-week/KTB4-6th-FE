import type { MeetingAttendeeData } from '@/entities/meeting-attendee';
import type { ApiResponse } from './common';

export interface MeetingInfoRequest {
  title: string;
  purpose: string;
  note: string;
  targetDurationMinutes: number;
}

export interface MeetingAttendeesRequest {
  attendeeTeamMemberIds: number[];
  customAttendeeNames: string[];
}

export type CreateMeetingRequest = MeetingInfoRequest & MeetingAttendeesRequest;

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
  attendees: MeetingAttendeeData[];
  createdAt: string;
}

export type CreateMeetingResponse = ApiResponse<CreateMeetingData>;

export interface MeetingUpdateRequest {
  title?: string;
  purpose?: string;
  note?: string;
  scheduledAt?: string;
  targetDurationMinutes?: number;
}

export interface MeetingUpdateData {
  meetingId: number;
  title: string;
  purpose: string;
  note: string;
  scheduledAt: string;
  targetDurationMinutes: number;
  updatedAt: string;
}

export type MeetingUpdateResponse = ApiResponse<MeetingUpdateData>;

export interface MeetingDetailData {
  meetingId: number;
  teamId: number;
  createdByTeamMemberId: number;
  title: string;
  purpose: string;
  note: string;
  scheduledAt: string;
  targetDurationMinutes: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  startedAt: string | null;
  endedAt: string | null;
  attendees: MeetingAttendeeData[];
  createdAt: string;
  updatedAt: string;
}

export type MeetingDetailResponse = ApiResponse<MeetingDetailData>;
