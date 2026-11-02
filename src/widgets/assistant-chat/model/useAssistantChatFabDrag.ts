'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { usePathname } from 'next/navigation';
import {
  ASSISTANT_CHAT_FAB_DRAG_THRESHOLD,
  clampAssistantChatFabPosition,
  getAssistantChatFabBounds,
  snapAssistantChatFabPosition,
  type AssistantChatFabBounds,
  type AssistantChatFabPosition,
  type AssistantChatFabSide,
} from './assistant-chat-fab-position';

interface DragSession {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startPosition: AssistantChatFabPosition;
  hasDragged: boolean;
}

interface SavedFabPosition {
  side: AssistantChatFabSide;
  y: number;
}

const FAB_POSITION_STORAGE_KEY = 'meety:assistant-chat-fab-position';

const readSavedFabPosition = (): SavedFabPosition | null => {
  try {
    const stored = window.sessionStorage.getItem(FAB_POSITION_STORAGE_KEY);
    if (!stored) return null;

    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') return null;

    const { side, y } = parsed as Record<string, unknown>;
    if ((side !== 'left' && side !== 'right') || typeof y !== 'number' || !Number.isFinite(y)) {
      return null;
    }
    return { side, y };
  } catch {
    return null;
  }
};

const saveFabPosition = (position: SavedFabPosition) => {
  try {
    window.sessionStorage.setItem(FAB_POSITION_STORAGE_KEY, JSON.stringify(position));
  } catch {}
};

export interface AssistantChatFabDrag {
  isReady: boolean;
  position: AssistantChatFabPosition | null;
  side: AssistantChatFabSide;
  isDragging: boolean;
  handlePointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  handlePointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  handlePointerUp: (event: PointerEvent<HTMLButtonElement>) => void;
  handlePointerCancel: (event: PointerEvent<HTMLButtonElement>) => void;
  handleLostPointerCapture: (event: PointerEvent<HTMLButtonElement>) => void;
  consumeDragClick: () => boolean;
}

export const useAssistantChatFabDrag = (
  bottomOffset: number,
  isVisible: boolean,
): AssistantChatFabDrag => {
  const pathname = usePathname();
  const [position, setPosition] = useState<AssistantChatFabPosition | null>(null);
  const [side, setSide] = useState<AssistantChatFabSide>('right');
  const [isReady, setIsReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const positionRef = useRef(position);
  const sideRef = useRef(side);
  const preferredYRef = useRef<number | null>(null);
  const hasRestoredRef = useRef(false);
  const sessionRef = useRef<DragSession | null>(null);
  const suppressClickRef = useRef(false);
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
          y: sessionRef.current?.hasDragged ? current.y : (preferredYRef.current ?? current.y),
        },
        bounds,
      );
      if (!sessionRef.current?.hasDragged) {
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
  }, [hasPosition, isVisible, measureBounds, pathname]);

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

  const getPositionFromPointer = (
    event: PointerEvent<HTMLButtonElement>,
    session: DragSession,
    bounds: AssistantChatFabBounds,
  ) =>
    clampAssistantChatFabPosition(
      {
        x: session.startPosition.x + event.clientX - session.startClientX,
        y: session.startPosition.y + event.clientY - session.startClientY,
      },
      bounds,
    );

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || event.button !== 0) return;

    suppressClickRef.current = false;
    const frame = document.getElementById('app-frame');
    if (!frame) return;

    const frameRect = frame.getBoundingClientRect();
    const buttonRect = event.currentTarget.getBoundingClientRect();
    sessionRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startPosition: {
        x: buttonRect.left - frameRect.left,
        y: buttonRect.top - frameRect.top,
      },
      hasDragged: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const session = sessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - session.startClientX;
    const deltaY = event.clientY - session.startClientY;
    if (!session.hasDragged) {
      if (Math.hypot(deltaX, deltaY) < ASSISTANT_CHAT_FAB_DRAG_THRESHOLD) return;
      session.hasDragged = true;
      setIsDragging(true);
    }

    const bounds = measureBounds();
    if (bounds) updatePosition(getPositionFromPointer(event, session, bounds));
  };

  const finishDrag = (event: PointerEvent<HTMLButtonElement>, isCancelled: boolean) => {
    const session = sessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    sessionRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!session.hasDragged) return;

    const bounds = measureBounds();
    if (bounds) {
      const current = isCancelled
        ? (positionRef.current ?? session.startPosition)
        : getPositionFromPointer(event, session, bounds);
      const snapped = snapAssistantChatFabPosition(current, bounds);
      preferredYRef.current = snapped.position.y;
      updatePosition(snapped.position);
      updateSide(snapped.side);
      saveFabPosition({ side: snapped.side, y: snapped.position.y });
    }
    setIsDragging(false);
    if (!isCancelled) suppressClickRef.current = true;
  };

  return {
    isReady,
    position,
    side,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp: (event) => finishDrag(event, false),
    handlePointerCancel: (event) => finishDrag(event, true),
    handleLostPointerCapture: (event) => finishDrag(event, true),
    consumeDragClick: () => {
      if (!suppressClickRef.current) return false;
      suppressClickRef.current = false;
      return true;
    },
  };
};
