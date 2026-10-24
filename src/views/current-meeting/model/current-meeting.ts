import type { MeetingAttendeeData } from '@/entities/meeting-attendee';

export interface TranscriptSegment {
  id: string;
  speakerName: string | null;
  startedAtSeconds: number;
  text: string;
}

export interface CurrentMeetingViewModel {
  title: string;
  recorderName: string;
  attendees: MeetingAttendeeData[];
  scheduledAt: string;
  targetMinutes: number;
  purpose: string;
  note: string;
  createdByTeamMemberId: number;
  recordingStartedByTeamMemberId: number | null;
  recordingSessionId: number | null;
  recordingStartedAt: string | null;
  elapsedSeconds: number;
  recordingStatus: 'waiting' | 'recording' | 'paused' | 'ending';
  transcripts: TranscriptSegment[];
}
