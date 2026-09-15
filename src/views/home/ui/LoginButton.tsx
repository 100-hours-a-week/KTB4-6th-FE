'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TeamSpaceStartSheet } from './TeamSpaceStartSheet';

interface LoginButtonProps {
  /**
   * 화면 설계서(Start-001) 기준 이 페이지에 노출되는 두 가지 인증 상태.
   * 참여 중인 팀 스페이스가 있는 경우는 Home으로 즉시 이동하므로 이 컴포넌트엔 없음.
   * 실제 인증 상태 연동은 추후 기능 구현 단계에서 처리.
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
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-kakao text-base font-semibold text-black transition-[filter] hover:brightness-95 active:brightness-90"
      >
        <KakaoIcon className="size-[18px]" />
        카카오로 시작하기
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

const KakaoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 3C6.477 3 2 6.463 2 10.714c0 2.72 1.85 5.109 4.634 6.478-.204.762-.739 2.76-.848 3.188-.135.53.194.523.409.381.169-.112 2.694-1.827 3.79-2.573.65.096 1.319.146 2.015.146 5.523 0 10-3.463 10-7.62C22 6.463 17.523 3 12 3z" />
  </svg>
);
