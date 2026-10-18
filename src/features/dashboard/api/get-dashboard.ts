import { apiClient } from '@/shared/api';
import type { DashboardDateRange } from '../model/dashboard-period';
import type { DashboardData, DashboardResponse } from '../model/types';

export const getDashboard = async (
  teamId: number,
  range: DashboardDateRange,
  signal?: AbortSignal,
): Promise<DashboardData> => {
  const response = await apiClient.get<DashboardResponse>(`/api/v1/teams/${teamId}/dashboard`, {
    params: range,
    signal,
  });
  const result = response.data;

  if (!result.success || !result.data) {
    throw new Error('대시보드를 조회하지 못했습니다.');
  }

  return result.data;
};
