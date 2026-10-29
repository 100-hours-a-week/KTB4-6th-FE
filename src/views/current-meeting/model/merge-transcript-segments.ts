import { toAiSpeakerName } from '@/entities/transcript-speaker';
import type { MeetingTranscriptSegmentData } from '@/features/meeting';
import type { SpeakerNames, TranscriptCreatedEventData } from '@/features/meeting-sse';
import type { TranscriptSegment } from './current-meeting';

const toLatestSpeakerName = (
  speakerNames: SpeakerNames,
  speakerId: number | null,
  speakerName: string | null,
) => (speakerId !== null && speakerId in speakerNames ? speakerNames[speakerId] : speakerName);

const toTranscriptSegmentFromHistory = (
  segment: MeetingTranscriptSegmentData,
  speakerNames: SpeakerNames,
): TranscriptSegment => ({
  id: String(segment.segmentId),
  speakerName: toLatestSpeakerName(
    speakerNames,
    segment.speakerId,
    segment.speakerDisplayName?.trim() || toAiSpeakerName(segment.speakerId),
  ),
  startedAtSeconds: Math.floor(segment.startedAtMs / 1000),
  text: segment.content,
});

const toTranscriptSegmentFromLive = (
  transcript: TranscriptCreatedEventData,
  speakerNames: SpeakerNames,
): TranscriptSegment => ({
  id: String(transcript.transcriptSegmentId),
  speakerName: toLatestSpeakerName(speakerNames, transcript.speakerId, transcript.speakerName),
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
  speakerNames: SpeakerNames,
): TranscriptSegment[] => {
  const bySequence = new Map<number, TranscriptSegment>();

  for (const segment of historySegments) {
    bySequence.set(segment.sequenceNumber, toTranscriptSegmentFromHistory(segment, speakerNames));
  }
  for (const transcript of liveTranscripts) {
    bySequence.set(
      transcript.sequenceNumber,
      toTranscriptSegmentFromLive(transcript, speakerNames),
    );
  }

  return [...bySequence.entries()]
    .sort(([leftSequence], [rightSequence]) => leftSequence - rightSequence)
    .map(([, segment]) => segment);
};
