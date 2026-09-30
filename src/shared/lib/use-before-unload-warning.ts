'use client';

import { useEffect } from 'react';

/**
 * isActive가 true인 동안 새로고침·탭 닫기를 시도하면 브라우저 기본 확인창을 띄운다.
 * 실제로 못 막는 건 아니고(사용자가 확인창에서 "나가기"를 선택하면 그대로 진행됨),
 * 실수로 나가는 것만 방지하는 용도.
 */
export const useBeforeUnloadWarning = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Chrome 등 일부 브라우저는 returnValue를 설정해야 확인창이 뜬다.
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive]);
};
