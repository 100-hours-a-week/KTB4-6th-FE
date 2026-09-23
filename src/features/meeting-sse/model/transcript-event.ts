export interface TranscriptCreatedEventData {
  type: 'TRANSCRIPT_CREATED';
  meetingId: number;
  recordingSessionId: number;
  transcriptSegmentId: number;
  sequenceNumber: number;
  text: string;
  startedAtMs: number;
  endedAtMs?: number;
  recognizedAt: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isPositiveSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

const isNonNegativeSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

export const parseTranscriptCreatedEvent = (data: string): TranscriptCreatedEventData | null => {
  let value: unknown;

  try {
    value = JSON.parse(data);
  } catch {
    return null;
  }

  if (
    !isRecord(value) ||
    value.type !== 'TRANSCRIPT_CREATED' ||
    !isPositiveSafeInteger(value.meetingId) ||
    !isPositiveSafeInteger(value.recordingSessionId) ||
    !isPositiveSafeInteger(value.transcriptSegmentId) ||
    !isNonNegativeSafeInteger(value.sequenceNumber) ||
    typeof value.text !== 'string' ||
    !isNonNegativeSafeInteger(value.startedAtMs) ||
    (value.endedAtMs !== undefined && !isNonNegativeSafeInteger(value.endedAtMs)) ||
    typeof value.recognizedAt !== 'string'
  ) {
    return null;
  }

  return {
    type: value.type,
    meetingId: value.meetingId,
    recordingSessionId: value.recordingSessionId,
    transcriptSegmentId: value.transcriptSegmentId,
    sequenceNumber: value.sequenceNumber,
    text: value.text,
    startedAtMs: value.startedAtMs,
    ...(value.endedAtMs === undefined ? {} : { endedAtMs: value.endedAtMs }),
    recognizedAt: value.recognizedAt,
  };
};
