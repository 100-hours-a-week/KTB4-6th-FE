export type NotificationType =
  'MEETING_STARTED' | 'SUMMARY_READY' | 'CREDIT_EARNED' | 'MEMBER_JOINED' | 'REPORT_READY';

export type NotificationReferenceType = 'MEETING' | 'REPORT' | 'CREDIT_LEDGER' | 'TEAM';

export interface NotificationData {
  notificationId: number;
  type: NotificationType;
  referenceType: NotificationReferenceType | null;
  referenceId: number | null;
  body: string;
  isRead: boolean;
  createdAt: string;
}
