export interface TranscriptCreatedEventData {
  type: 'TRANSCRIPT_CREATED';
  meetingId: number;
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

  const segment = isRecord(value) && isRecord(value.segment) ? value.segment : null;

  if (
    !isRecord(value) ||
    value.type !== 'TRANSCRIPT_CREATED' ||
    !isPositiveSafeInteger(value.meetingId) ||
    !segment ||
    !isPositiveSafeInteger(segment.id) ||
    !isNonNegativeSafeInteger(segment.sequenceNumber) ||
    typeof segment.content !== 'string' ||
    !isNonNegativeSafeInteger(segment.startedAtMs) ||
    (segment.endedAtMs !== undefined &&
      segment.endedAtMs !== null &&
      !isNonNegativeSafeInteger(segment.endedAtMs)) ||
    typeof segment.recognizedAt !== 'string'
  ) {
    return null;
  }

  return {
    type: value.type,
    meetingId: value.meetingId,
    transcriptSegmentId: segment.id,
    sequenceNumber: segment.sequenceNumber,
    text: segment.content,
    startedAtMs: segment.startedAtMs,
    ...(segment.endedAtMs === undefined || segment.endedAtMs === null
      ? {}
      : { endedAtMs: segment.endedAtMs }),
    recognizedAt: segment.recognizedAt,
  };
};
