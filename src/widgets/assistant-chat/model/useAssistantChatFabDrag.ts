'use client';

import { useRef, useState, type PointerEvent } from 'react';
import {
  ASSISTANT_CHAT_FAB_DRAG_THRESHOLD,
  clampAssistantChatFabPosition,
  type AssistantChatFabBounds,
  type AssistantChatFabPosition,
  type AssistantChatFabSide,
} from './assistant-chat-fab-position';
import { useAssistantChatFabPosition } from './useAssistantChatFabPosition';

interface DragSession {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startPosition: AssistantChatFabPosition;
  hasDragged: boolean;
}

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
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const sessionRef = useRef<DragSession | null>(null);
  const suppressClickRef = useRef(false);
  const {
    isReady,
    position,
    side,
    measureBounds,
    updatePosition,
    getCurrentPosition,
    snapAndSave,
  } = useAssistantChatFabPosition(bottomOffset, isVisible, isDraggingRef);

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
      isDraggingRef.current = true;
      setIsDragging(true);
    }

    const bounds = measureBounds();
    if (bounds) updatePosition(getPositionFromPointer(event, session, bounds));
  };

  const finishDrag = (event: PointerEvent<HTMLButtonElement>, isCancelled: boolean) => {
    const session = sessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    sessionRef.current = null;
    isDraggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!session.hasDragged) return;

    const bounds = measureBounds();
    if (bounds) {
      const current = isCancelled
        ? (getCurrentPosition() ?? session.startPosition)
        : getPositionFromPointer(event, session, bounds);
      snapAndSave(current, bounds);
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
