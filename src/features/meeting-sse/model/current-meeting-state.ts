import type { MeetingAttendeeData } from '@/entities/meeting-attendee';

export interface CurrentMeetingDetailData {
  title: string;
  purpose: string;
  note: string | null;
  /** 예정 시작 시각. 시간대 표기 없이 오는 서버 시각이다 */
  scheduledAt: string;
  targetDurationMinutes: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  createdByTeamMemberId: number;
  attendees?: MeetingAttendeeData[];
}

export interface ActiveRecordingData {
  recordingSessionId: number;
  startedByTeamMemberId: number;
  status: 'RECORDING' | 'PAUSED';
  startedAt: string;
  pausedAt: string | null;
  totalPausedDurationMs: number;
  endedAt: string | null;
}

export interface CurrentMeetingState {
  title: string;
  purpose: string;
  note: string;
  scheduledAt: string;
  targetMinutes: number;
  attendees: MeetingAttendeeData[];
  meetingStatus: CurrentMeetingDetailData['status'];
  recordingStatus: ActiveRecordingData['status'] | null;
  recordingStartedAt: string | null;
  recordingPausedAt: string | null;
  recordingTotalPausedDurationMs: number | null;
  recordingEndedAt: string | null;
  recordingStartedByTeamMemberId: number | null;
  recordingSessionId: number | null;
  createdByTeamMemberId: number;
}

export const toCurrentMeetingState = (
  meeting: CurrentMeetingDetailData,
  activeRecording: ActiveRecordingData | null,
): CurrentMeetingState => ({
  title: meeting.title,
  purpose: meeting.purpose,
  note: meeting.note ?? '',
  scheduledAt: meeting.scheduledAt,
  targetMinutes: meeting.targetDurationMinutes,
  attendees: meeting.attendees ?? [],
  meetingStatus: meeting.status,
  recordingStatus: activeRecording?.status ?? null,
  recordingStartedAt: activeRecording?.startedAt ?? null,
  recordingPausedAt: activeRecording?.pausedAt ?? null,
  recordingTotalPausedDurationMs: activeRecording?.totalPausedDurationMs ?? null,
  recordingEndedAt: activeRecording?.endedAt ?? null,
  recordingStartedByTeamMemberId: activeRecording?.startedByTeamMemberId ?? null,
  recordingSessionId: activeRecording?.recordingSessionId ?? null,
  createdByTeamMemberId: meeting.createdByTeamMemberId,
});
