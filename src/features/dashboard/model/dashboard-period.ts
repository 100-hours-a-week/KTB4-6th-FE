export const DASHBOARD_PERIOD_DAYS = [7, 14, 21, 28] as const;

export type DashboardPeriodDays = (typeof DASHBOARD_PERIOD_DAYS)[number];

export const DEFAULT_DASHBOARD_PERIOD_DAYS: DashboardPeriodDays = 7;
