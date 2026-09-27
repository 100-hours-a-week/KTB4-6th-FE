// 받침이 있는 숫자 읽기: 영(0)·일(1)·삼(3)·육(6)·칠(7)·팔(8)
const DIGITS_WITH_FINAL_CONSONANT = '013678';

const hasFinalConsonant = (char: string) => {
  const code = char.charCodeAt(0);
  const HANGUL_START = 0xac00;
  const HANGUL_END = 0xd7a3;

  if (code >= HANGUL_START && code <= HANGUL_END) return (code - HANGUL_START) % 28 !== 0;
  return DIGITS_WITH_FINAL_CONSONANT.includes(char);
};

/** 마지막 글자의 받침에 맞춰 조사 `와`/`과`를 붙인 문자열을 돌려준다. (한글·숫자 외 글자는 `와`) */
export const withWaGwa = (word: string) => {
  const lastChar = word.trim().slice(-1);
  return `${word}${lastChar && hasFinalConsonant(lastChar) ? '과' : '와'}`;
};
