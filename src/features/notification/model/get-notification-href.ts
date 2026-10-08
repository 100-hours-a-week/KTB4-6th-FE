import type { NotificationData } from './types';

export const getNotificationHref = (
  teamId: number,
  { type, referenceId }: Pick<NotificationData, 'type' | 'referenceId'>,
): string | null => {
  const teamPath = `/teams/${teamId}`;

  switch (type) {
    case 'MEETING_STARTED':
      return referenceId === null ? null : `${teamPath}/meetings/${referenceId}`;
    case 'SUMMARY_READY':
      return referenceId === null ? null : `${teamPath}/meetings/${referenceId}?tab=summary`;
    case 'CREDIT_EARNED':
      return `${teamPath}/creditmanage`;
    case 'MEMBER_JOINED':
    case 'MEMBER_REJOINED':
      return `${teamPath}/manage`;
    case 'TEAM_JOINED':
    case 'TEAM_REJOINED':
      return teamPath;
    case 'REPORT_READY':
      return null;
  }
};
