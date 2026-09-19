export const teamKeys = {
  detail: (teamId: number) => ['teams', teamId, 'detail'] as const,
  members: (teamId: number) => ['teams', teamId, 'members'] as const,
  credits: (teamId: number) => ['teams', teamId, 'credits'] as const,
};
