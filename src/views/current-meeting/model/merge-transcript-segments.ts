import type { MeetingTranscriptSegmentData } from '@/features/meeting';
import type { TranscriptCreatedEventData } from '@/features/meeting-sse';
import type { TranscriptSegment } from './current-meeting';

const toTranscriptSegmentFromHistory = (
  segment: MeetingTranscriptSegmentData,
): TranscriptSegment => ({
  id: String(segment.segmentId),
  speakerNumber: null,
  startedAtSeconds: Math.floor(segment.startedAtMs / 1000),
  text: segment.content,
});

const toTranscriptSegmentFromLive = (
  transcript: TranscriptCreatedEventData,
): TranscriptSegment => ({
  id: String(transcript.transcriptSegmentId),
  speakerNumber: null,
  startedAtSeconds: Math.floor(transcript.startedAtMs / 1000),
  text: transcript.text,
});

/**
 * 늦게 입장하거나 새로고침한 참여자도 이전 발화를 볼 수 있도록, 조회로 받아온 과거 전사와
 * SSE로 실시간 수신한 전사를 회의 안 발화 순서(sequenceNumber) 기준으로 합친다.
 * 같은 순번이 양쪽에 다 있으면 하나로 취급한다.
 */
export const mergeTranscriptSegments = (
  historySegments: MeetingTranscriptSegmentData[],
  liveTranscripts: TranscriptCreatedEventData[],
): TranscriptSegment[] => {
  const bySequence = new Map<number, TranscriptSegment>();

  for (const segment of historySegments) {
    bySequence.set(segment.sequenceNumber, toTranscriptSegmentFromHistory(segment));
  }
  for (const transcript of liveTranscripts) {
    bySequence.set(transcript.sequenceNumber, toTranscriptSegmentFromLive(transcript));
  }

  return [...bySequence.entries()]
    .sort(([leftSequence], [rightSequence]) => leftSequence - rightSequence)
    .map(([, segment]) => segment);
};
