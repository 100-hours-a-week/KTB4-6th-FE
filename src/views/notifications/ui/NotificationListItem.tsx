import { NotificationTypeIcon, type NotificationData } from '@/features/notification';
import { breakSentences, cn, formatRelativeTime } from '@/shared/lib';

interface NotificationListItemProps {
  notification: NotificationData;
  onSelect: (notification: NotificationData) => void;
}

export const NotificationListItem = ({ notification, onSelect }: NotificationListItemProps) => {
  const isUnread = !notification.isRead;

  return (
    <li
      className={cn(
        'flex items-center gap-3.5 border-b border-cool-200 px-5 py-4',
        isUnread && 'bg-brand-50',
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(notification)}
        className="-m-1 flex min-w-0 flex-1 items-start gap-3.5 rounded-lg p-1 text-left focus-visible:ring-3 focus-visible:ring-brand-300 focus-visible:outline-none"
      >
        <NotificationTypeIcon type={notification.type} isUnread={isUnread} />
        <span className="min-w-0 flex-1">
          {isUnread && <span className="sr-only">읽지 않은 알림, </span>}
          <span
            className={cn(
              'block text-[15px] leading-snug text-balance break-keep whitespace-pre-line text-cool-900',
              isUnread ? 'font-semibold' : 'font-normal',
            )}
          >
            {breakSentences(notification.body)}
          </span>
          <time dateTime={notification.createdAt} className="mt-1 block text-[13px] text-cool-500">
            {formatRelativeTime(notification.createdAt)}
          </time>
        </span>
      </button>
      <button
        type="button"
        className="shrink-0 rounded-lg px-2 py-1.5 text-sm text-cool-500 transition-colors hover:bg-cool-100 hover:text-cool-700"
      >
        삭제
      </button>
    </li>
  );
};
