export const getCurrentMeetingQueryKey = (meetingId: number) =>
  ['meetings', meetingId, 'current-state'] as const;
