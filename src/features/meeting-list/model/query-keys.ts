export const meetingListKeys = {
  list: (teamId: number) => ['teams', teamId, 'meetings'] as const,
};
