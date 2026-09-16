import { cookies } from 'next/headers';
import { WelcomePage } from '@/views/welcome';

interface WelcomeProps {
  searchParams: Promise<{
    teamSpace?: string | string[];
    loginError?: string | string[];
  }>;
}

export default async function Welcome({ searchParams }: WelcomeProps) {
  const { teamSpace, loginError } = await searchParams;
  const cookieStore = await cookies();
  const authState = cookieStore.has('accessToken') ? 'authenticated' : 'unauthenticated';
  const loginErrorCode = Array.isArray(loginError) ? loginError[0] : loginError;
  const loginErrorMessage =
    loginErrorCode === 'cancelled'
      ? '카카오 로그인이 취소되었습니다.'
      : loginErrorCode === 'failed'
        ? '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.'
        : undefined;

  return (
    <WelcomePage
      authState={authState}
      isTeamSpaceSheetInitiallyOpen={teamSpace === 'start'}
      loginError={loginErrorMessage}
    />
  );
}
