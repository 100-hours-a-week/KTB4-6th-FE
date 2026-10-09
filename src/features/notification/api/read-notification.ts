import { getMockNotifications, waitForMockResponse } from '../model/mock-notifications';

export const readNotification = async (teamId: number, notificationId: number) => {
  await waitForMockResponse();

  const notification = getMockNotifications(teamId).find(
    (mockNotification) => mockNotification.notificationId === notificationId,
  );

  if (notification) {
    notification.isRead = true;
  }
};
