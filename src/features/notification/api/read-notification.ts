import { apiClient } from '@/shared/api';
import type { NotificationApiResponse, NotificationReadData } from '../model/types';

export const readNotification = async (notificationId: number): Promise<NotificationReadData> => {
  const response = await apiClient.patch<NotificationApiResponse<NotificationReadData>>(
    `/api/v1/notifications/${notificationId}`,
    { isRead: true },
  );
  const result = response.data;

  if (!result.success || !result.data) {
    throw new Error('알림 읽음 처리에 실패했습니다.');
  }

  return result.data;
};
