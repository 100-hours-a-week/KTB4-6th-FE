import type { TranscriptEntry } from './preview-meeting-transcript';

/**
 * 재생 위치(ms)에 해당하는 전사 항목의 ID를 돌려준다.
 * 마지막으로 시작한 발화를 계속 가리키므로 발화 사이의 침묵에서도 유지되고, 첫 발화가 시작되기 전에는 null이다.
 * entries는 시작 시각 순으로 정렬돼 있어야 한다.
 */
export const getActiveTranscriptId = (entries: TranscriptEntry[], positionMs: number) => {
  let activeId: string | null = null;

  for (const entry of entries) {
    if (entry.startedAtMs > positionMs) break;
    activeId = entry.id;
  }

  return activeId;
};
