import { parseServerDate } from './parse-server-date';

const DAY_MS = 24 * 60 * 60 * 1000;

/** 만료 시각까지 남은 일수를 올림으로 센다. 이미 만료됐으면 0 이하가 아니라 null을 돌려준다. */
export const getAudioRemainingDays = (expiresAt: string, now: number): number | null => {
  const remainingMs = parseServerDate(expiresAt).getTime() - now;

  return remainingMs > 0 ? Math.ceil(remainingMs / DAY_MS) : null;
};
