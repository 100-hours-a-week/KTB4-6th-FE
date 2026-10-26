import type { TranscriptEntry } from './types';

export const getActiveTranscriptId = (entries: TranscriptEntry[], positionMs: number) => {
  let activeId: string | null = null;

  for (const entry of entries) {
    if (entry.startedAtMs > positionMs) break;
    activeId = entry.id;
  }

  return activeId;
};
