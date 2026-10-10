import { parseServerDate } from './parse-server-date';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const formatRelativeTime = (value: string, now: number = Date.now()) => {
  const elapsedMs = now - parseServerDate(value).getTime();

  if (elapsedMs < MINUTE_MS) {
    return '지금';
  }

  if (elapsedMs < HOUR_MS) {
    return `${Math.floor(elapsedMs / MINUTE_MS)}분 전`;
  }

  if (elapsedMs < DAY_MS) {
    return `${Math.floor(elapsedMs / HOUR_MS)}시간 전`;
  }

  return `${Math.floor(elapsedMs / DAY_MS)}일 전`;
};
