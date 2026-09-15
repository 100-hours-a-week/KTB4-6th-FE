import { LoginButton } from './LoginButton';

interface WelcomePageProps {
  /** 디자인 확인용 prop. 실제 인증 상태 연동은 추후 기능 구현 단계에서 처리. */
  authState?: 'unauthenticated' | 'authenticated';
  isTeamSpaceSheetInitiallyOpen?: boolean;
}

const FEATURES = ['실시간 녹취와 자동 요약', '태스크 생성과 담당자 배정', 'AI 회의 코칭과 리포트'];

export const WelcomePage = ({
  authState = 'unauthenticated',
  isTeamSpaceSheetInitiallyOpen = false,
}: WelcomePageProps) => {
  return (
    <div className="flex flex-1 flex-col bg-white px-6 pt-20 pb-10">
      <div className="flex flex-col items-start gap-5">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-600">
          <span className="size-3 rounded-full border-2 border-white" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">Meety</h1>
          <p className="text-base leading-relaxed text-cool-600">
            회의가 끝나면 요약과 태스크는
            <br />
            이미 정리되어 있습니다
          </p>
        </div>

        <ul className="flex flex-col gap-2 text-sm text-cool-500">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="size-1 shrink-0 rounded-full bg-cool-400" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1" />

      <LoginButton
        authState={authState}
        isTeamSpaceSheetInitiallyOpen={isTeamSpaceSheetInitiallyOpen}
      />
    </div>
  );
};
