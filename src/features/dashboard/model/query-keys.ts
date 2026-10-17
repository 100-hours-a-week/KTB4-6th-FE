import type { DashboardPeriodDays } from './dashboard-period';

export const dashboardKeys = {
  detail: (teamId: number, days: DashboardPeriodDays) =>
    ['teams', teamId, 'dashboard', days] as const,
};
