export interface AssistantChatFabPosition {
  x: number;
  y: number;
}

export interface AssistantChatFabBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export type AssistantChatFabSide = 'left' | 'right';

export const ASSISTANT_CHAT_FAB_SIZE = 81;
export const ASSISTANT_CHAT_FAB_EDGE_INSET = 13;
export const ASSISTANT_CHAT_FAB_BOTTOM_INSET = 21;
export const ASSISTANT_CHAT_FAB_DRAG_THRESHOLD = 8;

const MIN_TOP_INSET = 64;
const HEADER_GAP = 12;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const getAssistantChatFabBounds = (
  frameRect: Pick<DOMRect, 'top' | 'width' | 'height'>,
  headerBottom: number | undefined,
  bottomOffset: number,
): AssistantChatFabBounds => {
  const minX = ASSISTANT_CHAT_FAB_EDGE_INSET;
  const minY = Math.max(
    MIN_TOP_INSET,
    headerBottom === undefined ? 0 : headerBottom - frameRect.top + HEADER_GAP,
  );

  return {
    minX,
    maxX: Math.max(minX, frameRect.width - ASSISTANT_CHAT_FAB_EDGE_INSET - ASSISTANT_CHAT_FAB_SIZE),
    minY,
    maxY: Math.max(
      minY,
      frameRect.height - bottomOffset - ASSISTANT_CHAT_FAB_BOTTOM_INSET - ASSISTANT_CHAT_FAB_SIZE,
    ),
  };
};

export const clampAssistantChatFabPosition = (
  position: AssistantChatFabPosition,
  bounds: AssistantChatFabBounds,
): AssistantChatFabPosition => ({
  x: clamp(position.x, bounds.minX, bounds.maxX),
  y: clamp(position.y, bounds.minY, bounds.maxY),
});

export const snapAssistantChatFabPosition = (
  position: AssistantChatFabPosition,
  bounds: AssistantChatFabBounds,
): { position: AssistantChatFabPosition; side: AssistantChatFabSide } => {
  const side = position.x - bounds.minX <= bounds.maxX - position.x ? 'left' : 'right';

  return {
    position: { x: side === 'left' ? bounds.minX : bounds.maxX, y: position.y },
    side,
  };
};
