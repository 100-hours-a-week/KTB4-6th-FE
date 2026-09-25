export const meetingKeys = {
  summary: (meetingId: number) => ['meetings', meetingId, 'summary'] as const,
  transcript: (meetingId: number) => ['meetings', meetingId, 'transcript'] as const,
};
