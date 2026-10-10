import { apiClient } from '@/shared/api';
import type { NotificationApiResponse, NotificationsReadData } from '../model/types';

export const readAllNotifications = async (): Promise<NotificationsReadData> => {
  const response = await apiClient.patch<NotificationApiResponse<NotificationsReadData>>(
    '/api/v1/notifications',
    { isRead: true },
  );
  const result = response.data;

  if (!result.success || !result.data) {
    throw new Error('알림 모두 읽음 처리에 실패했습니다.');
  }

  return result.data;
};
