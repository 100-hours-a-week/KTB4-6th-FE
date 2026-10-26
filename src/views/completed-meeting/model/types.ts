export interface TranscriptEntry {
  id: string;
  speakerName: string;
  startedAtMs: number;
  endedAtMs: number;
  text: string;
}

export interface TeamMember {
  id: string;
  name: string;
}

export type CompletedMeetingViewerRole = 'leader' | 'member';
