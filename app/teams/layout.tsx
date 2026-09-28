import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface TeamsLayoutProps {
  children: ReactNode;
}

export default async function TeamsLayout({ children }: TeamsLayoutProps) {
  const cookieStore = await cookies();

  if (!cookieStore.has('accessToken')) redirect('/?authRequired=1');

  return children;
}
