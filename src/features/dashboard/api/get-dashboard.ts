import { apiClient } from '@/shared/api';
import type { DashboardPeriodDays } from '../model/dashboard-period';
import type { DashboardData, DashboardResponse } from '../model/types';

export const getDashboard = async (
  teamId: number,
  days: DashboardPeriodDays,
  signal?: AbortSignal,
): Promise<DashboardData> => {
  const response = await apiClient.get<DashboardResponse>(`/api/v1/teams/${teamId}/dashboard`, {
    params: { days },
    signal,
  });
  const result = response.data;

  if (!result.success || !result.data) {
    throw new Error('대시보드를 조회하지 못했습니다.');
  }

  return result.data;
};
