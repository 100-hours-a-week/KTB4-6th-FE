import { apiClient } from '@/shared/api';
import type { NotificationApiResponse, NotificationListData } from '../model/types';

const NOTIFICATION_PAGE_SIZE = 20;

export const getNotifications = async (cursor?: number): Promise<NotificationListData> => {
  const response = await apiClient.get<NotificationApiResponse<NotificationListData>>(
    '/api/v1/notifications',
    { params: { cursor, size: NOTIFICATION_PAGE_SIZE } },
  );
  const result = response.data;

  if (!result.success || !result.data) {
    throw new Error('알림 목록 조회에 실패했습니다.');
  }

  return result.data;
};
