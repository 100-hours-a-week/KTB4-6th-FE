import { getMockNotifications } from '../model/mock-notifications';
import type { NotificationData } from '../model/types';

const MOCK_DELAY_MS = 300;

export const getNotifications = async (teamId: number): Promise<NotificationData[]> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  return getMockNotifications(teamId).map((notification) => ({ ...notification }));
};
