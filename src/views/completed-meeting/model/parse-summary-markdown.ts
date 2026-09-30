export type SummaryBlock =
  { type: 'list'; isOrdered: boolean; items: string[] } | { type: 'paragraph'; text: string };

export interface SummarySection {
  /** `#`·`##` 제목. 제목 앞의 내용이면 null */
  title: string | null;
  blocks: SummaryBlock[];
}

const HEADING = /^(#{1,6})\s+(.*)$/;
const HORIZONTAL_RULE = /^([-*_])\1{2,}$/;
const UNORDERED_ITEM = /^[-*+•]\s+(.*)$/;
const ORDERED_ITEM = /^\d+[.)]\s+(.*)$/;

// `이름: 값` 형태의 목록 항목. 콜론 뒤에 공백이 있어야 해서 `오후 3:00` 같은 시각은 나누지 않는다.
const BOLD_KEY_VALUE_OUTSIDE = /^\*\*([^*]{1,12}?)\*\*\s*[:：]\s*(.+)$/; // **이름**: 값
const BOLD_KEY_VALUE_INSIDE = /^\*\*([^*]{1,12}?)\s*[:：]\*\*\s*(.+)$/; // **이름:** 값
const KEY_VALUE = /^([^:：*]{1,12})(?::\s+|：\s*)(.+)$/;

/** 굵게(`**`) 표시 기호를 지운 글자 */
export const stripBold = (text: string) => text.replace(/\*\*(.+?)\*\*/g, '$1');

/**
 * AI 요약(Markdown)을 `#`·`##` 제목별 섹션으로 나눈다.
 * 목록(`-`, `1.`)과 문단만 구분하고, 그 밖의 표기는 글자 그대로 문단으로 둔다.
 * 제목 아래에 내용이 없는 섹션은 버린다.
 */
export const parseSummaryMarkdown = (markdown: string): SummarySection[] => {
  const sections: SummarySection[] = [];
  let current: SummarySection = { title: null, blocks: [] };
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;

    current.blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') });
    paragraphLines = [];
  };
  const finishSection = () => {
    flushParagraph();
    if (current.blocks.length > 0) sections.push(current);
  };

  for (const rawLine of markdown.replace(/\r\n?/g, '\n').split('\n')) {
    const line = rawLine.trim();

    if (line === '' || HORIZONTAL_RULE.test(line)) {
      flushParagraph();
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const title = stripBold(heading[2]).trim();

      if (heading[1].length <= 2) {
        finishSection();
        current = { title, blocks: [] };
      } else {
        // 소제목은 굵은 문단으로 보여준다.
        flushParagraph();
        current.blocks.push({ type: 'paragraph', text: `**${title}**` });
      }
      continue;
    }

    const ordered = ORDERED_ITEM.exec(line);
    const unordered = ordered ? null : UNORDERED_ITEM.exec(line);
    const item = ordered ?? unordered;
    if (item) {
      flushParagraph();
      const isOrdered = ordered !== null;
      const lastBlock = current.blocks.at(-1);

      if (lastBlock?.type === 'list' && lastBlock.isOrdered === isOrdered) {
        lastBlock.items.push(item[1]);
      } else {
        current.blocks.push({ type: 'list', isOrdered, items: [item[1]] });
      }
      continue;
    }

    paragraphLines.push(line);
  }

  finishSection();
  return sections;
};

/** `이름: 값` 형태의 목록 항목이면 이름과 값으로 나누고, 아니면 null */
export const splitKeyValue = (item: string) => {
  const match =
    BOLD_KEY_VALUE_OUTSIDE.exec(item) ?? BOLD_KEY_VALUE_INSIDE.exec(item) ?? KEY_VALUE.exec(item);

  return match ? { key: match[1].trim(), value: match[2].trim() } : null;
};
