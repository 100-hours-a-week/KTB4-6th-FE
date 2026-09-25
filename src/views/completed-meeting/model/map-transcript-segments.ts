import type { MeetingTranscriptSegmentData } from '@/features/meeting';
import type { TranscriptEntry } from './preview-meeting-transcript';

/**
 * 전사 조회 응답의 발화 목록을 화면에서 쓰는 전사 항목으로 바꾼다.
 * 서버가 준 순서에 기대지 않고 발화 순서(`sequenceNumber`)대로 정렬하며, 발화자 이름은 서버가 준 표시 이름 그대로 쓴다.
 */
export const mapTranscriptSegments = (
  segments: MeetingTranscriptSegmentData[],
): TranscriptEntry[] =>
  [...segments]
    .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
    .map((segment) => ({
      id: String(segment.segmentId),
      speakerName: segment.speakerDisplayName,
      startedAtMs: segment.startedAtMs,
      endedAtMs: segment.endedAtMs,
      text: segment.content,
    }));
