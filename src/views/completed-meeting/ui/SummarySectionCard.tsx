import type { SummarySection } from '../model/parse-summary-markdown';
import { splitKeyValue } from '../model/parse-summary-markdown';
import { SummaryCard } from './SummaryCard';
import { SummaryInlineText } from './SummaryInlineText';

interface SummarySectionCardProps {
  section: SummarySection;
}

const BulletItem = ({ item }: { item: string }) => {
  const keyValue = splitKeyValue(item);

  return (
    <li className="flex items-start gap-2.5 text-sm leading-6 text-cool-600">
      <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-cool-300" />
      <span>
        {keyValue ? (
          <>
            <strong className="font-semibold text-cool-900">{keyValue.key}</strong>
            {' · '}
            <SummaryInlineText text={keyValue.value} />
          </>
        ) : (
          <SummaryInlineText text={item} />
        )}
      </span>
    </li>
  );
};

const AssigneeItem = ({ name, role }: { name: string; role: string }) => (
  <li className="flex items-start gap-3">
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700"
    >
      {name.charAt(0)}
    </span>
    <div className="min-w-0">
      <p className="text-sm font-bold text-cool-900">{name}</p>
      <p className="mt-0.5 text-sm leading-6 text-cool-600">
        <SummaryInlineText text={role} />
      </p>
    </div>
  </li>
);

/** 요약의 한 섹션을 카드로 보여준다. `담당자` 섹션의 `이름: 역할` 목록은 이니셜 아바타와 함께 보여준다. */
export const SummarySectionCard = ({ section }: SummarySectionCardProps) => {
  const isAssigneeSection = section.title?.includes('담당자') ?? false;

  return (
    <SummaryCard title={section.title}>
      <div className="flex flex-col gap-3">
        {section.blocks.map((block, blockIndex) => {
          if (block.type === 'paragraph') {
            return (
              <p key={blockIndex} className="text-sm leading-6 text-cool-600">
                <SummaryInlineText text={block.text} />
              </p>
            );
          }

          if (block.isOrdered) {
            return (
              <ol key={blockIndex} className="flex flex-col gap-2.5">
                {block.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm leading-6 text-cool-600"
                  >
                    <span className="w-3 shrink-0 text-cool-500">{index + 1}</span>
                    <span>
                      <SummaryInlineText text={item} />
                    </span>
                  </li>
                ))}
              </ol>
            );
          }

          const assignees = isAssigneeSection ? block.items.map((item) => splitKeyValue(item)) : [];
          const isAssigneeList = assignees.length > 0 && assignees.every((assignee) => assignee);

          if (isAssigneeList) {
            return (
              <ul key={blockIndex} className="flex flex-col gap-3.5">
                {assignees.map((assignee) => (
                  <AssigneeItem key={assignee!.key} name={assignee!.key} role={assignee!.value} />
                ))}
              </ul>
            );
          }

          return (
            <ul key={blockIndex} className="flex flex-col gap-2">
              {block.items.map((item, index) => (
                <BulletItem key={index} item={item} />
              ))}
            </ul>
          );
        })}
      </div>
    </SummaryCard>
  );
};
