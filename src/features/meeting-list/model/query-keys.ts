export const meetingListKeys = {
  list: (teamId: number) => ['teams', teamId, 'meetings'] as const,
  todayAll: (teamId: number) => [...meetingListKeys.list(teamId), 'today'] as const,
  today: (teamId: number, date: string) => [...meetingListKeys.todayAll(teamId), date] as const,
};
