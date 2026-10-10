import { apiClient } from '@/shared/api';

export const deleteNotification = async (notificationId: number) => {
  await apiClient.delete(`/api/v1/notifications/${notificationId}`);
};
