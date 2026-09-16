import { cookies } from 'next/headers';
import { WelcomePage } from '@/views/welcome';

interface WelcomeProps {
  searchParams: Promise<{ teamSpace?: string | string[] }>;
}

export default async function Welcome({ searchParams }: WelcomeProps) {
  const { teamSpace } = await searchParams;
  const cookieStore = await cookies();
  const authState = cookieStore.has('accessToken') ? 'authenticated' : 'unauthenticated';

  return (
    <WelcomePage authState={authState} isTeamSpaceSheetInitiallyOpen={teamSpace === 'start'} />
  );
}
