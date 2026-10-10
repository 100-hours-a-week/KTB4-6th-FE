export type NotificationType =
  | 'MEETING_STARTED'
  | 'SUMMARY_READY'
  | 'CREDIT_EARNED'
  | 'MEMBER_JOINED'
  | 'MEMBER_REJOINED'
  | 'TEAM_JOINED'
  | 'TEAM_REJOINED'
  | 'REPORT_READY';

export type NotificationReferenceType = 'MEETING' | 'REPORT' | 'CREDIT' | 'TEAM';

export interface NotificationData {
  notificationId: number;
  type: NotificationType;
  referenceType: NotificationReferenceType | null;
  referenceId: number | null;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListData {
  notifications: NotificationData[];
  unreadCount: number;
  nextCursor: number | null;
  hasNext: boolean;
}

interface ApiErrorPayload {
  code: string;
  message: string;
}

export interface NotificationApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorPayload | null;
}

export interface NotificationReadData {
  notificationId: number;
  isRead: boolean;
  unreadCount: number;
}

export interface NotificationsReadData {
  readCount: number;
  unreadCount: number;
}
