'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../api/get-dashboard';
import type { DashboardPeriodDays } from './dashboard-period';
import { dashboardKeys } from './query-keys';

export const useDashboard = (teamId: number, days: DashboardPeriodDays) =>
  useQuery({
    queryKey: dashboardKeys.detail(teamId, days),
    queryFn: ({ signal }) => getDashboard(teamId, days, signal),
  });
