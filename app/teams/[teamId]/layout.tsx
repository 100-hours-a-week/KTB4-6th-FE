import type { ReactNode } from 'react';
import { NotificationBannerHost } from '@/app/ui';

interface TeamLayoutProps {
  children: ReactNode;
  params: Promise<{ teamId: string }>;
}

export default async function TeamLayout({ children, params }: TeamLayoutProps) {
  const { teamId } = await params;

  return (
    <>
      {children}
      <NotificationBannerHost teamId={Number(teamId)} />
    </>
  );
}
