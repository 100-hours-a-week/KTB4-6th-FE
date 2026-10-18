import { Toast } from '@base-ui/react/toast';
import type { NotificationData } from './types';

export const notificationBannerManager = Toast.createToastManager<NotificationData>();

export const showNotificationBanner = (notification: NotificationData) => {
  notificationBannerManager.close();
  notificationBannerManager.add({ data: notification });
};
