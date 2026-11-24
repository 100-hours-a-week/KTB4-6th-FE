import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getHomeOnServer, homeKeys } from '@/features/home/index.server';
import { HomeContent } from './HomeContent';
import { HomeNotice } from './HomeNotice';
import { HomePageSkeleton } from './HomePageSkeleton';

interface HomePageProps {
  teamId: number;
}

const PrefetchedHomeContent = async ({ teamId }: HomePageProps) => {
  const accessToken = (await cookies()).get('accessToken')?.value;
  const queryClient = new QueryClient();

  if (accessToken) {
    await getHomeOnServer(accessToken)
      .then((home) => queryClient.setQueryData(homeKeys.all, home))
      .catch(() => undefined);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeContent teamId={teamId} />
    </HydrationBoundary>
  );
};

export const HomePage = ({ teamId }: HomePageProps) => (
  <>
    <Suspense fallback={null}>
      <HomeNotice teamId={teamId} />
    </Suspense>
    <Suspense fallback={<HomePageSkeleton />}>
      <PrefetchedHomeContent teamId={teamId} />
    </Suspense>
  </>
);
