import Image from 'next/image';
import { LoginButton } from './LoginButton';

interface WelcomePageProps {
  /** 서버에서 Access Token 쿠키를 기준으로 확인한 인증 상태. */
  authState?: 'unauthenticated' | 'authenticated';
  isTeamSpaceSheetInitiallyOpen?: boolean;
  loginError?: string;
  /** 로그인 없이 보호된 라우트에 접근해 리다이렉트된 경우 안내 토스트를 띄운다. */
  isAuthRequiredNotice?: boolean;
}

const FEATURES = ['실시간 녹취와 자동 요약', 'AI 회의 코칭과 리포트'];

export const WelcomePage = ({
  authState = 'unauthenticated',
  isTeamSpaceSheetInitiallyOpen = false,
  loginError,
  isAuthRequiredNotice = false,
}: WelcomePageProps) => {
  return (
    <div className="flex flex-1 flex-col bg-white px-6 pt-20 pb-10">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <Image
          src="/brand/mascot/meety-01-excited-transparent.png"
          alt=""
          width={160}
          height={160}
          priority
          className="h-40 w-40"
        />

        <div className="flex flex-col items-center gap-2">
          <h1 className="font-display text-4xl font-bold tracking-tight text-brand-900">Meety</h1>
          <p className="text-base leading-relaxed text-cool-600">
            회의가 끝나면 요약과 태스크는
            <br />
            이미 정리되어 있습니다
          </p>
        </div>

        <ul className="flex flex-col items-start gap-2 rounded-2xl bg-cool-50 px-6 py-5 text-sm text-cool-500">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="size-1 shrink-0 rounded-full bg-cool-400" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <LoginButton
        authState={authState}
        isTeamSpaceSheetInitiallyOpen={isTeamSpaceSheetInitiallyOpen}
        loginError={loginError}
        isAuthRequiredNotice={isAuthRequiredNotice}
      />
    </div>
  );
};
