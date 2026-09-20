import { apiClient } from '@/shared/api';

import type { HomeData, HomeResponse } from '../model/types';

export const getHome = async (): Promise<HomeData> => {
  const response = await apiClient.get<HomeResponse>('/api/v1/home');
  const result = response.data;

  if (!result.success || !result.data) {
    throw new Error('홈 정보 조회에 실패했습니다.');
  }

  return result.data;
};
