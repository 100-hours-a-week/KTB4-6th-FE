'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { startKakaoLogin } from '@/features/auth';
import { useHome } from '@/features/home';
import { useStartTeamSpace } from '@/features/team-space';
import { useAppToast } from '@/shared/ui';
import { TeamSpaceStartSheet } from './TeamSpaceStartSheet';

interface LoginButtonProps {
  /** 서버에서 Access Token 쿠키 존재 여부로 확인한 인증 상태. */
  authState?: 'unauthenticated' | 'authenticated';
  isTeamSpaceSheetInitiallyOpen?: boolean;
  loginError?: string;
  isAuthRequiredNotice?: boolean;
}

export const LoginButton = ({
  authState = 'unauthenticated',
  isTeamSpaceSheetInitiallyOpen = false,
  loginError,
  isAuthRequiredNotice = false,
}: LoginButtonProps) => {
  const router = useRouter();
  const { showToast } = useAppToast();
  const [isTeamSpaceSheetOpen, setIsTeamSpaceSheetOpen] = useState(isTeamSpaceSheetInitiallyOpen);
  const hasShownAuthRequiredToast = useRef(false);

  useEffect(() => {
    // Strict Mode에서 effect가 두 번 실행돼도 토스트가 중복으로 뜨지 않도록 막는다.
    if (!isAuthRequiredNotice || hasShownAuthRequiredToast.current) return;
    hasShownAuthRequiredToast.current = true;
    showToast('로그인이 필요합니다', 'warning');
    router.replace('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- authRequired 쿼리로 진입했을 때 1회만 실행
  }, [isAuthRequiredNotice]);
  const { isCheckingActiveTeam, hasActiveTeam, hasActiveTeamError, startTeamSpace } =
    useStartTeamSpace({
      isEnabled: authState === 'authenticated',
      onNoActiveTeam: () => {
        setIsTeamSpaceSheetOpen(true);
      },
    });
  const homeQuery = useHome({ isEnabled: hasActiveTeam });

  const isStarting = isCheckingActiveTeam || (homeQuery.isFetching && !homeQuery.data);
  const hasStartError = hasActiveTeamError || (homeQuery.isError && !homeQuery.isFetching);

  const handleStart = async () => {
    const hasTeam = await startTeamSpace();

    if (!hasTeam) return;

    const home = homeQuery.data ?? (await homeQuery.refetch()).data;

    if (home) {
      router.push(`/teams/${home.team.teamId}`);
    }
  };

  const handleCloseTeamSpaceSheet = () => {
    setIsTeamSpaceSheetOpen(false);
    router.replace('/');
  };

  if (authState === 'authenticated') {
    return (
      <>
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => void handleStart()}
            disabled={isStarting}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-brand-600 text-base font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-300 active:bg-brand-800"
          >
            {isStarting ? '팀 스페이스 확인 중...' : '팀 스페이스 시작하기'}
          </button>
          {hasStartError ? (
            <p role="alert" className="text-xs text-red-500">
              팀 스페이스 정보를 불러오지 못했습니다.
            </p>
          ) : (
            <p className="text-xs text-cool-500">참여 중인 팀 스페이스를 확인합니다</p>
          )}
        </div>
        <TeamSpaceStartSheet isOpen={isTeamSpaceSheetOpen} onClose={handleCloseTeamSpaceSheet} />
      </>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        aria-label="카카오 로그인"
        className="mx-auto flex h-[45px] w-full max-w-[300px] items-center justify-center gap-1.5 rounded-lg bg-[#FEE500] text-black/85 transition-[filter] hover:brightness-95 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-300 active:brightness-90"
        onClick={startKakaoLogin}
      >
        {/* 카카오 심볼: 디벨로퍼스 리소스 다운로드의 공식 SVG에서 심볼 부분만 그대로 가져옴 */}
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="61.5225 16.5225 12.9555 12.9555"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M68.001 16.5225C64.4222 16.5225 61.5225 19.0037 61.5225 22.0641C61.5225 24.0312 62.7219 25.7596 64.5292 26.7423L63.9181 29.2113C63.8954 29.285 63.9132 29.364 63.9619 29.4184C63.9975 29.457 64.0461 29.478 64.0931 29.478C64.1337 29.478 64.1742 29.464 64.2082 29.4341L66.834 27.5144C67.2117 27.5723 67.6007 27.6039 67.9994 27.6039C71.5767 27.6039 74.478 25.1226 74.478 22.0623C74.478 19.002 71.5783 16.5225 68.001 16.5225Z"
            fill="currentColor"
          />
        </svg>
        <span className="text-sm font-medium">카카오 로그인</span>
      </button>
      {loginError ? (
        <p
          role="alert"
          className="w-full max-w-[300px] rounded-xl bg-danger-bg px-4 py-3 text-center text-sm text-danger"
        >
          {loginError}
        </p>
      ) : null}
      <p className="text-xs text-cool-500">
        계속하면 서비스 이용약관 및{' '}
        <a href="#" className="underline underline-offset-2">
          개인정보 처리방침
        </a>
        에 동의하게 됩니다
      </p>
    </div>
  );
};
