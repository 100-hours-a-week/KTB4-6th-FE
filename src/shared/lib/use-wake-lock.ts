'use client';

import { useEffect, useRef } from 'react';

/**
 * isActive가 true인 동안 화면이 꺼지지 않게 유지한다.
 * 브라우저가 탭을 백그라운드로 보내면 Wake Lock이 자동 해제되므로,
 * 탭이 다시 보일 때 isActive면 재요청한다.
 */
export const useWakeLock = (isActive: boolean) => {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!isActive || !('wakeLock' in navigator)) return;

    let cancelled = false;

    const requestWakeLock = async () => {
      try {
        const sentinel = await navigator.wakeLock.request('screen');

        if (cancelled) {
          await sentinel.release();
          return;
        }

        sentinelRef.current = sentinel;
      } catch {
        // 배터리 세이버 등으로 요청이 거부될 수 있다 — 화면이 꺼지는 것 외엔 기능에 영향 없어 조용히 넘어간다.
      }
    };

    void requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !sentinelRef.current) {
        void requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      void sentinelRef.current?.release();
      sentinelRef.current = null;
    };
  }, [isActive]);
};
