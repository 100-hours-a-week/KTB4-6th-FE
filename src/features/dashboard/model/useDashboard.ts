'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../api/get-dashboard';
import type { DashboardDateRange } from './dashboard-period';
import { dashboardKeys } from './query-keys';

export const useDashboard = (teamId: number, range: DashboardDateRange) =>
  useQuery({
    queryKey: dashboardKeys.detail(teamId, range),
    queryFn: ({ signal }) => getDashboard(teamId, range, signal),
  });
