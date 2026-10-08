export const meetingListKeys = {
  list: (teamId: number) => ['teams', teamId, 'meetings'] as const,
  today: (teamId: number, date: string) =>
    [...meetingListKeys.list(teamId), 'today', date] as const,
  search: (teamId: number, keyword: string) =>
    [...meetingListKeys.list(teamId), 'search', keyword] as const,
};
