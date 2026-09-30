import type { MeetingTranscriptSegmentData } from '@/features/meeting';
import type { TranscriptEntry } from './preview-meeting-transcript';

/** 서버가 발화자 이름을 주지 않았을 때 대신 보여줄 이름. 이 이름도 눌러서 발화자를 연결할 수 있다. */
export const UNKNOWN_SPEAKER_NAME = '발화자 없음';

/**
 * 전사 조회 응답의 발화 목록을 화면에서 쓰는 전사 항목으로 바꾼다.
 * 서버가 준 순서에 기대지 않고 발화 순서(`sequenceNumber`)대로 정렬하며, 발화자 이름은 서버가 준 표시 이름을 쓰되 비어 있으면 대체 이름을 쓴다.
 */
export const mapTranscriptSegments = (
  segments: MeetingTranscriptSegmentData[],
): TranscriptEntry[] =>
  [...segments]
    .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
    .map((segment) => ({
      id: String(segment.segmentId),
      speakerName: segment.speakerDisplayName?.trim() || UNKNOWN_SPEAKER_NAME,
      startedAtMs: segment.startedAtMs,
      endedAtMs: segment.endedAtMs,
      text: segment.content,
    }));
