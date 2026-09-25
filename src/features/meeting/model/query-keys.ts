export const meetingKeys = {
  summary: (meetingId: number) => ['meetings', meetingId, 'summary'] as const,
  transcript: (meetingId: number) => ['meetings', meetingId, 'transcript'] as const,
  speakerMapping: (meetingId: number, segmentId: number) =>
    ['meetings', meetingId, 'transcript', segmentId, 'speaker-mapping'] as const,
};
