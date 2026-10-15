import type { MeetingAttendeeData } from '@/entities/meeting-attendee';

export interface TranscriptSegment {
  id: string;
  speakerNumber: number | null;
  startedAtSeconds: number;
  text: string;
}

export interface CurrentMeetingViewModel {
  title: string;
  recorderName: string;
  participantCount: number;
  attendees: MeetingAttendeeData[];
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
