export const meetingKeys = {
  summary: (meetingId: number) => ['meetings', meetingId, 'summary'] as const,
};
