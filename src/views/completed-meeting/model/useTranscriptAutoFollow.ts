'use client';

import { useEffect, useRef, useState } from 'react';
export const useTranscriptAutoFollow = (activeEntryId: string | null, isEnabled: boolean) => {
  const containerRef = useRef<HTMLElement>(null);
  const [isFollowing, setIsFollowing] = useState(true);
  const isFollowStartingRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!isEnabled || !container) return;

    const handleWheel = () => setIsFollowing(false);
    const handleTouchMove = () => setIsFollowing(false);
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
      isFollowStartingRef.current = true;
      setIsFollowing(true);
    };
  }, [isEnabled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!isEnabled || !isFollowing || !container) return;

    if (isFollowStartingRef.current) {
      isFollowStartingRef.current = false;
      if (container.scrollTop > 0) {
        setIsFollowing(false);
        return;
      }
    }

    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';

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
