'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { startKakaoLogin } from '@/features/auth';
import { useHome } from '@/features/home';
import { useStartTeamSpace } from '@/features/team-space';
import { TeamSpaceStartSheet } from './TeamSpaceStartSheet';

interface LoginButtonProps {
  /** 서버에서 Access Token 쿠키 존재 여부로 확인한 인증 상태. */
  authState?: 'unauthenticated' | 'authenticated';
  isTeamSpaceSheetInitiallyOpen?: boolean;
  loginError?: string;
}

export const LoginButton = ({
  authState = 'unauthenticated',
  isTeamSpaceSheetInitiallyOpen = false,
  loginError,
}: LoginButtonProps) => {
  const router = useRouter();
  const [isTeamSpaceSheetOpen, setIsTeamSpaceSheetOpen] = useState(isTeamSpaceSheetInitiallyOpen);
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
        className="mx-auto block w-full max-w-[300px] overflow-hidden rounded-[12px] transition-[filter] hover:brightness-95 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-300 active:brightness-90"
        onClick={startKakaoLogin}
      >
        <Image
          src="/kakao_login_medium_wide.png"
          alt=""
          width={300}
          height={45}
          className="h-auto w-full"
        />
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
