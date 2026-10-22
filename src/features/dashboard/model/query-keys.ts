import type { DashboardDateRange } from './dashboard-period';

export const dashboardKeys = {
  detail: (teamId: number, range: DashboardDateRange) =>
    ['teams', teamId, 'dashboard', range.from, range.to] as const,
};
