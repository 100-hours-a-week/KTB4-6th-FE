'use client';

import { Toast } from '@base-ui/react/toast';
import { X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { breakSentences, cn, useAppFrameElement } from '@/shared/lib';
import { getNotificationCategory } from '../model/get-notification-category';
import { notificationBannerManager } from '../model/notification-banner-manager';
import type { NotificationData } from '../model/types';
import { useOpenNotification } from '../model/useOpenNotification';
import { NotificationTypeIcon } from './NotificationTypeIcon';

const NOTIFICATION_BANNER_DURATION_MS = 3000;

export const NotificationBannerHost = () => {
  const frame = useAppFrameElement();

  return (
    <Toast.Provider
      toastManager={notificationBannerManager}
      timeout={NOTIFICATION_BANNER_DURATION_MS}
    >
      <Toast.Portal container={frame}>
        <Toast.Viewport className="pointer-events-none fixed inset-x-0 top-3 z-[110] mx-auto flex w-full max-w-[390px] flex-col px-3">
          <NotificationBannerList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
};

const NotificationBannerList = () => {
  const { teamId } = useParams<{ teamId?: string }>();

  return teamId ? <TeamNotificationBanners teamId={Number(teamId)} /> : <NotificationBanners />;
};

const TeamNotificationBanners = ({ teamId }: { teamId: number }) => {
  const openNotification = useOpenNotification(teamId);

  return <NotificationBanners onOpen={openNotification} />;
};

interface NotificationBannersProps {
  onOpen?: (notification: NotificationData) => void;
}

const NotificationBanners = ({ onOpen }: NotificationBannersProps) => {
  const { toasts, close } = Toast.useToastManager<NotificationData>();

  return toasts.map((toast) => {
    if (!toast.data) {
      return null;
    }

    const notification = toast.data;

    return (
      <Toast.Root
        key={toast.id}
        toast={toast}
        swipeDirection="up"
        className={cn(
          'pointer-events-auto flex w-full items-center gap-3 rounded-2xl bg-white py-3.5 pr-2 pl-4 shadow-[0_8px_24px_rgba(20,34,56,0.14)]',
          '[transform:translateY(var(--toast-swipe-movement-y))] transition-all duration-200',
          'data-starting-style:[transform:translateY(-120%)] data-starting-style:opacity-0',
          'data-ending-style:[transform:translateY(-120%)] data-ending-style:opacity-0',
          'data-swiping:transition-none',
        )}
      >
        <button
          type="button"
          onClick={() => {
            close(toast.id);
            onOpen?.(notification);
          }}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left focus-visible:ring-3 focus-visible:ring-brand-300 focus-visible:outline-none"
        >
          <NotificationTypeIcon type={notification.type} />
          <span className="min-w-0 flex-1">
            <span className="block text-xs">
              <span className="font-semibold text-brand-600">
                {getNotificationCategory(notification.type)}
              </span>
              <span className="ml-1.5 text-cool-500">지금</span>
            </span>
            <Toast.Description
              render={<span />}
              className="mt-0.5 line-clamp-2 text-sm font-semibold text-balance break-keep whitespace-pre-line text-cool-900"
            >
              {breakSentences(notification.body)}
            </Toast.Description>
          </span>
        </button>
        <Toast.Close
          aria-label="알림 닫기"
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-cool-600 transition-colors hover:bg-cool-100"
        >
          <X className="size-5" strokeWidth={2} />
        </Toast.Close>
      </Toast.Root>
    );
  });
};
