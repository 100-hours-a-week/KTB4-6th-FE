'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getActiveTeam } from '@/features/team-space/api/get-active-team';
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
  const [isCheckingActiveTeam, setIsCheckingActiveTeam] = useState(false);
  const [activeTeamError, setActiveTeamError] = useState<string | null>(null);

  const handleCloseTeamSpaceSheet = () => {
    setIsTeamSpaceSheetOpen(false);
    router.replace('/');
  };

  const handleKakaoLogin = () => {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY ?? '',
      redirect_uri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ?? '',
      response_type: 'code',
    });

    window.location.href = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  };

  const handleTeamSpaceStart = async () => {
    if (isCheckingActiveTeam) return;

    setIsCheckingActiveTeam(true);
    setActiveTeamError(null);

    try {
      const activeTeam = await getActiveTeam();

      if (activeTeam.hasActiveTeam) {
        // TODO: 홈 페이지 구현 시 GET /api/v1/home/{teamId} 조회 후
        // /teams/{teamId}로 이동합니다. teamId는 activeTeam.teamId를 사용합니다.
        return;
      }

      setIsTeamSpaceSheetOpen(true);
    } catch {
      setActiveTeamError('팀 스페이스 정보를 불러오지 못했습니다.');
    } finally {
      setIsCheckingActiveTeam(false);
    }
  };

  if (authState === 'authenticated') {
    return (
      <>
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleTeamSpaceStart}
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
        onClick={handleKakaoLogin}
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
