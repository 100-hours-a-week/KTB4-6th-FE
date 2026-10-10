import Image from 'next/image';
import {
  ChartNoAxesColumn,
  Copyright,
  FileText,
  Mic,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib';
import type { NotificationType } from '../model/types';

type SelfJoinedNotificationType = Extract<NotificationType, 'TEAM_JOINED' | 'TEAM_REJOINED'>;

const MEMBER_JOINED_ICON = { icon: UserPlus, className: 'bg-success-bg text-success' };

const NOTIFICATION_TYPE_ICONS: Record<
  Exclude<NotificationType, SelfJoinedNotificationType>,
  { icon: LucideIcon; className: string }
> = {
  MEETING_STARTED: { icon: Mic, className: 'bg-cool-100 text-brand-700' },
  SUMMARY_READY: { icon: FileText, className: 'bg-cool-100 text-brand-700' },
  CREDIT_EARNED: { icon: Copyright, className: 'bg-warning-bg text-warning' },
  MEMBER_JOINED: MEMBER_JOINED_ICON,
  MEMBER_REJOINED: MEMBER_JOINED_ICON,
  REPORT_READY: { icon: ChartNoAxesColumn, className: 'bg-brand-100 text-brand-500' },
};

const isSelfJoinedType = (type: NotificationType): type is SelfJoinedNotificationType =>
  type === 'TEAM_JOINED' || type === 'TEAM_REJOINED';

interface NotificationTypeIconProps {
  type: NotificationType;
  isUnread?: boolean;
}

export const NotificationTypeIcon = ({ type, isUnread = false }: NotificationTypeIconProps) => {
  const renderIcon = () => {
    if (isSelfJoinedType(type)) {
      return (
        <Image
          src="/brand/mascot/meety-01-excited-transparent.png"
          alt=""
          width={40}
          height={40}
          className="size-10"
        />
      );
    }

    const { icon: Icon } = NOTIFICATION_TYPE_ICONS[type];

    return <Icon aria-hidden className="size-4.5" strokeWidth={2} />;
  };

  return (
    <span
      className={cn(
        'relative flex size-10 shrink-0 items-center justify-center rounded-xl',
        isSelfJoinedType(type) ? 'bg-brand-50' : NOTIFICATION_TYPE_ICONS[type].className,
      )}
    >
      {renderIcon()}
      {isUnread && (
        <span aria-hidden className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-danger" />
      )}
    </span>
  );
};
