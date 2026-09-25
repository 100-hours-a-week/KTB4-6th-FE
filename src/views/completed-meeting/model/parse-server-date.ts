/** 서버 시각은 시간대 표기 없이 오므로 한국 시간으로 본다. */
export const parseServerDate = (value: string) =>
  new Date(/(Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}+09:00`);
