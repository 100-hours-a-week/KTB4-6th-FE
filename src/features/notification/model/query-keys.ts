export const notificationKeys = {
  all: (teamId: number) => ['teams', teamId, 'notifications'] as const,
  list: (teamId: number) => [...notificationKeys.all(teamId), 'list'] as const,
};
