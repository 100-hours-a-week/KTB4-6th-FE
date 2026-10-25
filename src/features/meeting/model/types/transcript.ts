import type { ApiResponse } from './common';

export interface MeetingTranscriptSegmentData {
  segmentId: number;
  speakerDisplayName: string | null;
  sequenceNumber: number;
  content: string;
  startedAtMs: number;
  endedAtMs: number;
  recognizedAt: string;
  speakerId: number | null;
}

export type MeetingTranscriptResponse = ApiResponse<{ segments: MeetingTranscriptSegmentData[] }>;
