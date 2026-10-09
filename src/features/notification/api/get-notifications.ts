import { getMockNotifications, waitForMockResponse } from '../model/mock-notifications';
import type { NotificationData } from '../model/types';

export const getNotifications = async (teamId: number): Promise<NotificationData[]> => {
  await waitForMockResponse();

  return getMockNotifications(teamId).map((notification) => ({ ...notification }));
};
