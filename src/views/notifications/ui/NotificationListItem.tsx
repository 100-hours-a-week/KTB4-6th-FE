import { NotificationTypeIcon, type NotificationData } from '@/features/notification';
import { breakSentences, cn, formatRelativeTime } from '@/shared/lib';

interface NotificationListItemProps {
  notification: NotificationData;
}

export const NotificationListItem = ({ notification }: NotificationListItemProps) => {
  const isUnread = !notification.isRead;

  return (
    <li
      className={cn(
        'flex items-center gap-3.5 border-b border-cool-200 px-5 py-4',
        isUnread && 'bg-brand-50',
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <NotificationTypeIcon type={notification.type} isUnread={isUnread} />
        <div className="min-w-0 flex-1">
          {isUnread && <span className="sr-only">읽지 않은 알림, </span>}
          <p
            className={cn(
              'text-[15px] leading-snug text-balance break-keep whitespace-pre-line text-cool-900',
              isUnread ? 'font-semibold' : 'font-normal',
            )}
          >
            {breakSentences(notification.body)}
          </p>
          <time dateTime={notification.createdAt} className="mt-1 block text-[13px] text-cool-500">
            {formatRelativeTime(notification.createdAt)}
          </time>
        </div>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-lg px-2 py-1.5 text-sm text-cool-500 transition-colors hover:bg-cool-100 hover:text-cool-700"
      >
        삭제
      </button>
    </li>
  );
};
