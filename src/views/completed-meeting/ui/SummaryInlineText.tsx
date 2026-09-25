interface SummaryInlineTextProps {
  text: string;
}

/** `**굵게**` 표기만 굵은 글씨로 바꿔 보여주고, 나머지는 글자 그대로 보여준다. HTML은 해석하지 않는다. */
export const SummaryInlineText = ({ text }: SummaryInlineTextProps) =>
  text.split(/(\*\*[^*]+\*\*)/).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={index} className="font-semibold text-cool-900">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
