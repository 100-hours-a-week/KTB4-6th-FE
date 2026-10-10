import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NotificationRealtimeConnection } from '@/app/providers';
import { NotificationBannerHost } from '@/app/ui';

interface TeamsLayoutProps {
  children: ReactNode;
}

export default async function TeamsLayout({ children }: TeamsLayoutProps) {
  const cookieStore = await cookies();

  if (!cookieStore.has('accessToken')) redirect('/?authRequired=1');

  return (
    <>
      {children}
      <NotificationBannerHost />
      <NotificationRealtimeConnection />
    </>
  );
}
