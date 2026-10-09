import { getMockNotifications, waitForMockResponse } from '../model/mock-notifications';

export const readAllNotifications = async (teamId: number) => {
  await waitForMockResponse();

  getMockNotifications(teamId).forEach((notification) => {
    notification.isRead = true;
  });
};
