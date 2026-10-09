import type { NotificationType } from './types';

const NOTIFICATION_CATEGORIES: Record<NotificationType, string> = {
  MEETING_STARTED: '회의',
  SUMMARY_READY: '회의',
  CREDIT_EARNED: '크레딧',
  MEMBER_JOINED: '팀',
  MEMBER_REJOINED: '팀',
  TEAM_JOINED: '팀',
  TEAM_REJOINED: '팀',
  REPORT_READY: '리포트',
};

export const getNotificationCategory = (type: NotificationType) => NOTIFICATION_CATEGORIES[type];
