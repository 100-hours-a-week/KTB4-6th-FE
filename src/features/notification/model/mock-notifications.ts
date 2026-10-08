import type { NotificationData } from './types';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const toCreatedAt = (elapsedMs: number) => new Date(Date.now() - elapsedMs).toISOString();

const createMockNotifications = (): NotificationData[] => [
  {
    notificationId: 6,
    type: 'MEETING_STARTED',
    referenceType: 'MEETING',
    referenceId: 1,
    body: '김민수 님이 회의를 시작했습니다',
    isRead: false,
    createdAt: toCreatedAt(5 * MINUTE_MS),
  },
  {
    notificationId: 5,
    type: 'SUMMARY_READY',
    referenceType: 'MEETING',
    referenceId: 1,
    body: '디자인 리뷰 회의 요약이 새로 생성되었습니다',
    isRead: false,
    createdAt: toCreatedAt(30 * MINUTE_MS),
  },
  {
    notificationId: 4,
    type: 'CREDIT_EARNED',
    referenceType: 'CREDIT_LEDGER',
    referenceId: null,
    body: '20 크레딧이 충전되었습니다',
    isRead: false,
    createdAt: toCreatedAt(HOUR_MS),
  },
  {
    notificationId: 3,
    type: 'MEMBER_JOINED',
    referenceType: 'TEAM',
    referenceId: null,
    body: '이지은 님이 팀에 합류했습니다',
    isRead: true,
    createdAt: toCreatedAt(2 * HOUR_MS),
  },
  {
    notificationId: 2,
    type: 'REPORT_READY',
    referenceType: 'REPORT',
    referenceId: 1,
    body: '회의 동향 리포트가 도착했습니다',
    isRead: true,
    createdAt: toCreatedAt(DAY_MS),
  },
  {
    notificationId: 1,
    type: 'MEMBER_JOINED',
    referenceType: 'TEAM',
    referenceId: null,
    body: '팀에 합류했어요! 이제 팀원들과 회의를 시작해보세요.',
    isRead: true,
    createdAt: toCreatedAt(3 * DAY_MS),
  },
];

const mockNotificationStore = new Map<number, NotificationData[]>();

export const getMockNotifications = (teamId: number) => {
  const stored = mockNotificationStore.get(teamId);

  if (stored) {
    return stored;
  }

  const created = createMockNotifications();
  mockNotificationStore.set(teamId, created);

  return created;
};
