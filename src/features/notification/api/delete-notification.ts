import { getMockNotifications, waitForMockResponse } from '../model/mock-notifications';

export const deleteNotification = async (teamId: number, notificationId: number) => {
  await waitForMockResponse();

  const notifications = getMockNotifications(teamId);
  const index = notifications.findIndex(
    (notification) => notification.notificationId === notificationId,
  );

  if (index !== -1) {
    notifications.splice(index, 1);
  }
};
