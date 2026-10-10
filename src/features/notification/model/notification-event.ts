import type { NotificationData, NotificationReferenceType, NotificationType } from './types';

export const NOTIFICATION_SSE_EVENTS = {
  connected: 'CONNECTED',
  notificationCreated: 'NOTIFICATION_CREATED',
} as const;

const NOTIFICATION_TYPES = {
  MEETING_STARTED: true,
  SUMMARY_READY: true,
  CREDIT_EARNED: true,
  MEMBER_JOINED: true,
  MEMBER_REJOINED: true,
  TEAM_JOINED: true,
  TEAM_REJOINED: true,
  REPORT_READY: true,
} satisfies Record<NotificationType, true>;

const NOTIFICATION_REFERENCE_TYPES = {
  MEETING: true,
  REPORT: true,
  CREDIT: true,
  TEAM: true,
} satisfies Record<NotificationReferenceType, true>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isPositiveSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

const isNotificationType = (value: unknown): value is NotificationType =>
  typeof value === 'string' && Object.hasOwn(NOTIFICATION_TYPES, value);

const isNotificationReferenceType = (value: unknown): value is NotificationReferenceType =>
  typeof value === 'string' && Object.hasOwn(NOTIFICATION_REFERENCE_TYPES, value);

export const parseNotificationCreatedEvent = (data: string): NotificationData | null => {
  let value: unknown;

  try {
    value = JSON.parse(data);
  } catch {
    return null;
  }

  if (
    !isRecord(value) ||
    value.type !== NOTIFICATION_SSE_EVENTS.notificationCreated ||
    !isPositiveSafeInteger(value.notificationId) ||
    !isNotificationType(value.notificationType) ||
    typeof value.body !== 'string' ||
    (value.referenceType !== null && !isNotificationReferenceType(value.referenceType)) ||
    (value.referenceId !== null && !isPositiveSafeInteger(value.referenceId)) ||
    typeof value.isRead !== 'boolean' ||
    typeof value.createdAt !== 'string'
  ) {
    return null;
  }

  return {
    notificationId: value.notificationId,
    type: value.notificationType,
    referenceType: value.referenceType,
    referenceId: value.referenceId,
    body: value.body,
    isRead: value.isRead,
    createdAt: value.createdAt,
  };
};
