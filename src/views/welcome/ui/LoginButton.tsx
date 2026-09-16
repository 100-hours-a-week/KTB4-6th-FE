'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { startKakaoLogin } from '@/features/auth';
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
  const { isCheckingActiveTeam, activeTeamError, startTeamSpace } = useStartTeamSpace(() => {
    setIsTeamSpaceSheetOpen(true);
  });

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
            onClick={() => void startTeamSpace()}
            disabled={isCheckingActiveTeam}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-brand-600 text-base font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-300 active:bg-brand-800"
          >
            {isCheckingActiveTeam ? '팀 스페이스 확인 중...' : '팀 스페이스 시작하기'}
          </button>
          {activeTeamError ? (
            <p role="alert" className="text-xs text-red-500">
              {activeTeamError}
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
