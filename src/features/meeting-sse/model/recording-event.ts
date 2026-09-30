export const RECORDING_SSE_EVENT_TYPES = [
  'RECORDING_STARTED',
  'RECORDING_PAUSED',
  'RECORDING_RESUMED',
  'RECORDING_COMPLETED',
] as const;

export type RecordingSseEventType = (typeof RECORDING_SSE_EVENT_TYPES)[number];
