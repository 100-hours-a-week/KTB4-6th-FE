'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { usePathname } from 'next/navigation';
import {
  clampAssistantChatFabPosition,
  getAssistantChatFabBounds,
  snapAssistantChatFabPosition,
  type AssistantChatFabBounds,
  type AssistantChatFabPosition,
  type AssistantChatFabSide,
} from './assistant-chat-fab-position';
import { readSavedFabPosition, saveFabPosition } from './assistant-chat-fab-storage';

export const useAssistantChatFabPosition = (
  bottomOffset: number,
  isVisible: boolean,
  isDraggingRef: RefObject<boolean>,
) => {
  const pathname = usePathname();
  const [position, setPosition] = useState<AssistantChatFabPosition | null>(null);
  const [side, setSide] = useState<AssistantChatFabSide>('right');
  const [isReady, setIsReady] = useState(false);
  const positionRef = useRef(position);
  const sideRef = useRef(side);
  const preferredYRef = useRef<number | null>(null);
  const hasRestoredRef = useRef(false);
  const hasPosition = position !== null;

  const updatePosition = (nextPosition: AssistantChatFabPosition) => {
    positionRef.current = nextPosition;
    setPosition(nextPosition);
  };

  const updateSide = (nextSide: AssistantChatFabSide) => {
    sideRef.current = nextSide;
    setSide(nextSide);
  };

  const measureBounds = useCallback((): AssistantChatFabBounds | null => {
    const frame = document.getElementById('app-frame');
    if (!frame) return null;

    const frameRect = frame.getBoundingClientRect();
    const headerBottom = frame.querySelector('header')?.getBoundingClientRect().bottom;
    return getAssistantChatFabBounds(frameRect, headerBottom, bottomOffset);
  }, [bottomOffset]);

  useEffect(() => {
    if (!isVisible || !positionRef.current) return;

    const frame = document.getElementById('app-frame');
    if (!frame) return;

    const resizeObserver = new ResizeObserver(syncPosition);
    let header: Element | null = null;

    function syncPosition() {
      const current = positionRef.current;
      const bounds = measureBounds();
      if (!current || !bounds) return;

      const next = clampAssistantChatFabPosition(
        {
          x: current.x,
          y: isDraggingRef.current ? current.y : (preferredYRef.current ?? current.y),
        },
        bounds,
      );
      if (!isDraggingRef.current) {
        next.x = sideRef.current === 'left' ? bounds.minX : bounds.maxX;
      }
      if (next.x !== current.x || next.y !== current.y) updatePosition(next);
    }

    const syncHeader = () => {
      const nextHeader = frame.querySelector('header');
      if (nextHeader !== header) {
        if (header) resizeObserver.unobserve(header);
        header = nextHeader;
        if (header) resizeObserver.observe(header);
      }
      syncPosition();
    };

    const mutationObserver = new MutationObserver(syncHeader);
    resizeObserver.observe(frame);
    mutationObserver.observe(frame, { childList: true, subtree: true });
    frame.addEventListener('scroll', syncPosition, true);
    window.addEventListener('resize', syncPosition);
    syncHeader();

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      frame.removeEventListener('scroll', syncPosition, true);
      window.removeEventListener('resize', syncPosition);
    };
  }, [hasPosition, isVisible, isDraggingRef, measureBounds, pathname]);

  useEffect(() => {
    if (hasRestoredRef.current) return;

    let isCancelled = false;
    queueMicrotask(() => {
      if (isCancelled) return;

      const saved = readSavedFabPosition();
      const bounds = measureBounds();
      if (saved && bounds) {
        preferredYRef.current = saved.y;
        updateSide(saved.side);
        updatePosition(
          clampAssistantChatFabPosition(
            { x: saved.side === 'left' ? bounds.minX : bounds.maxX, y: saved.y },
            bounds,
          ),
        );
      }
      hasRestoredRef.current = true;
      setIsReady(true);
    });

    return () => {
      isCancelled = true;
    };
  }, [measureBounds]);

  const snapAndSave = (nextPosition: AssistantChatFabPosition, bounds: AssistantChatFabBounds) => {
    const snapped = snapAssistantChatFabPosition(nextPosition, bounds);
    preferredYRef.current = snapped.position.y;
    updatePosition(snapped.position);
    updateSide(snapped.side);
    saveFabPosition({ side: snapped.side, y: snapped.position.y });
  };

  return {
    isReady,
    position,
    side,
    measureBounds,
    updatePosition,
    getCurrentPosition: () => positionRef.current,
    snapAndSave,
  };
};
