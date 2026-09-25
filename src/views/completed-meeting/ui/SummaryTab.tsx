import { parseSummaryMarkdown } from '../model/parse-summary-markdown';
import { AiSummaryBanner } from './AiSummaryBanner';
import { SummarySectionCard } from './SummarySectionCard';

interface SummaryTabProps {
  /** AI 요약 본문(Markdown) */
  content: string;
  currentCredits: number;
}

export const SummaryTab = ({ content, currentCredits }: SummaryTabProps) => {
  const sections = parseSummaryMarkdown(content);

  return (
    <div className="flex flex-col gap-3 px-5 py-5">
      <AiSummaryBanner currentCredits={currentCredits} />

      {sections.map((section, index) => (
        <SummarySectionCard key={index} section={section} />
      ))}

      <p className="px-1 pt-1 pb-2 text-xs leading-5 text-cool-500">
        AI가 요약한 결과라 정확하지 않을 수 있어요. 중요한 내용은 전사에서 확인해주세요.
      </p>
    </div>
  );
};
