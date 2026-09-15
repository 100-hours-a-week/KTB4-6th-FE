'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { TeamSpaceStartSheet } from './TeamSpaceStartSheet';

interface LoginButtonProps {
  /**
   * 참여 중인 팀 스페이스가 있는 경우는 Home으로 즉시 이동하므로 이 컴포넌트엔 없음
   * 실제 인증 상태 연동은 추후 기능 구현 단계에서 처리
   */
  authState?: 'unauthenticated' | 'authenticated';
  isTeamSpaceSheetInitiallyOpen?: boolean;
}

export const LoginButton = ({
  authState = 'unauthenticated',
  isTeamSpaceSheetInitiallyOpen = false,
}: LoginButtonProps) => {
  const router = useRouter();
  const [isTeamSpaceSheetOpen, setIsTeamSpaceSheetOpen] = useState(isTeamSpaceSheetInitiallyOpen);

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
            onClick={() => setIsTeamSpaceSheetOpen(true)}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-brand-600 text-base font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-300 active:bg-brand-800"
          >
            팀 스페이스 참여하기
          </button>
          <p className="text-xs text-cool-500">참여 중인 팀 스페이스가 없습니다</p>
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
      >
        <Image
          src="/kakao_login_medium_wide.png"
          alt=""
          width={300}
          height={45}
          className="h-auto w-full"
        />
      </button>
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
