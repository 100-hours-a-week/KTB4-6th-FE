import type { ReactNode } from 'react';
import { AuthTokenKeeper, NotificationRealtimeConnection } from '@/app/providers';
import { NotificationBannerHost } from '@/app/ui';

interface TeamsLayoutProps {
  children: ReactNode;
}

export default function TeamsLayout({ children }: TeamsLayoutProps) {
  return (
    <>
      {children}
      <NotificationBannerHost />
      <AuthTokenKeeper />
      <NotificationRealtimeConnection />
    </>
  );
}
