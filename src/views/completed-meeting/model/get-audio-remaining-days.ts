const DAY_MS = 24 * 60 * 60 * 1000;

// 서버 시각은 시간대 표기 없이 오므로 한국 시간으로 본다.
const parseServerDate = (value: string) =>
  new Date(/(Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}+09:00`);

/** 만료 시각까지 남은 일수를 올림으로 센다. 이미 만료됐으면 0 이하가 아니라 null을 돌려준다. */
export const getAudioRemainingDays = (expiresAt: string, now: number): number | null => {
  const remainingMs = parseServerDate(expiresAt).getTime() - now;

  return remainingMs > 0 ? Math.ceil(remainingMs / DAY_MS) : null;
};
