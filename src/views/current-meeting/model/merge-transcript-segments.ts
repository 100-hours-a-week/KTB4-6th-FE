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
