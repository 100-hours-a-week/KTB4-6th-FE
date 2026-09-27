'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 재생 위치에 맞춰 강조된 전사 항목을 스크롤 영역의 가운데로 따라가며 보여준다.
 * 사용자가 직접 스크롤(휠·터치·스크롤바)하면 읽고 있는 위치를 빼앗지 않도록 따라가기를 멈추고,
 * resumeFollowing으로 다시 따라간다. 따라갈 수 있는 상태(isEnabled)가 끝나면 다음을 위해 다시 켠다.
 *
 * 항목은 data-entry-id 속성으로 찾는다.
 */
export const useTranscriptAutoFollow = (activeEntryId: string | null, isEnabled: boolean) => {
  const containerRef = useRef<HTMLElement>(null);
  const [isFollowing, setIsFollowing] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!isEnabled || !container) return;

    // 스크롤을 코드로 옮길 때는 이 이벤트들이 생기지 않아, 사용자가 직접 조작한 경우만 잡을 수 있다.
    const handleWheel = () => setIsFollowing(false);
    const handleTouchMove = () => setIsFollowing(false);
    // 스크롤바를 누르면 이벤트 대상이 스크롤 영역 자신이다.
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target === container) setIsFollowing(false);
    };

    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('pointerdown', handlePointerDown);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('pointerdown', handlePointerDown);
      setIsFollowing(true);
    };
  }, [isEnabled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!isEnabled || !isFollowing || !container) return;

    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';

    // 첫 발화 전이면 목록의 맨 위를 보여준다.
    if (!activeEntryId) {
      container.scrollTo({ top: 0, behavior });
      return;
    }

    const item = container.querySelector<HTMLElement>(
      `[data-entry-id="${CSS.escape(activeEntryId)}"]`,
    );
    if (!item) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const offsetToCenter =
      itemRect.top - containerRect.top - (container.clientHeight - itemRect.height) / 2;

    container.scrollTo({ top: container.scrollTop + offsetToCenter, behavior });
  }, [activeEntryId, isEnabled, isFollowing]);

  const resumeFollowing = () => setIsFollowing(true);

  return { containerRef, isFollowing, resumeFollowing };
};
