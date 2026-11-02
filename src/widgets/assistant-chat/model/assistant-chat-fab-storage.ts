import type { AssistantChatFabSide } from './assistant-chat-fab-position';

interface SavedFabPosition {
  side: AssistantChatFabSide;
  y: number;
}

const FAB_POSITION_STORAGE_KEY = 'meety:assistant-chat-fab-position';

export const readSavedFabPosition = (): SavedFabPosition | null => {
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

export const saveFabPosition = (position: SavedFabPosition) => {
  try {
    window.sessionStorage.setItem(FAB_POSITION_STORAGE_KEY, JSON.stringify(position));
  } catch {}
};
