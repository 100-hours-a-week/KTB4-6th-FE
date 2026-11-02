import { toAiSpeakerName } from '@/entities/transcript-speaker';
import type { MeetingTranscriptSegmentData } from '@/features/meeting';
import type { TranscriptEntry } from './types';

export const UNKNOWN_SPEAKER_NAME = '발화자 없음';

export const mapTranscriptSegments = (
  segments: MeetingTranscriptSegmentData[],
): TranscriptEntry[] =>
  [...segments]
    .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
    .map((segment) => ({
      id: String(segment.segmentId),
      speakerName:
        segment.speakerDisplayName?.trim() ||
        toAiSpeakerName(segment.speakerId) ||
        UNKNOWN_SPEAKER_NAME,
      startedAtMs: segment.startedAtMs,
      endedAtMs: segment.endedAtMs,
      text: segment.content,
    }));
