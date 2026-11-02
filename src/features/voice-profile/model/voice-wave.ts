const WAVE_BAR_COUNT = 18;
const WAVE_MIN_DB = -60;
const WAVE_MAX_DB = -10;

export const EMPTY_WAVE_LEVELS: number[] = Array(WAVE_BAR_COUNT).fill(0);

const toWaveLevel = (levelDb: number) =>
  Math.min(1, Math.max(0, (levelDb - WAVE_MIN_DB) / (WAVE_MAX_DB - WAVE_MIN_DB)));

export const pushWaveLevel = (levels: number[], levelDb: number) => [
  ...levels.slice(1),
  toWaveLevel(levelDb),
];
