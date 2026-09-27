export const TRANSCRIPT_SEARCH_KEYWORD_MIN_LENGTH = 2;
export const TRANSCRIPT_SEARCH_KEYWORD_MAX_LENGTH = 20;

/**
 * 입력값을 전사 검색어로 쓸 수 있는지 판단한다.
 * 앞뒤 공백을 지우고, 공백만 입력했거나 길이가 2~20자를 벗어나면 검색어 없음(null)으로 본다.
 */
export const normalizeTranscriptSearchKeyword = (rawInput: string): string | null => {
  const trimmed = rawInput.trim();

  if (
    trimmed.length < TRANSCRIPT_SEARCH_KEYWORD_MIN_LENGTH ||
    trimmed.length > TRANSCRIPT_SEARCH_KEYWORD_MAX_LENGTH
  ) {
    return null;
  }

  return trimmed;
};
