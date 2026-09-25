import type { MeetingSummary } from '../model/preview-meeting-summary';
import { AiSummaryBanner } from './AiSummaryBanner';
import { SummaryCard } from './SummaryCard';

interface SummaryTabProps {
  summary: MeetingSummary;
  currentCredits: number;
}

const BulletItem = ({ label, children }: { label?: string; children: string }) => (
  <li className="flex items-start gap-2.5 text-sm leading-6 text-cool-600">
    <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-cool-300" />
    <span>
      {label && (
        <>
          <strong className="font-semibold text-cool-900">{label}</strong>
          {' · '}
        </>
      )}
      {children}
    </span>
  </li>
);

export const SummaryTab = ({ summary, currentCredits }: SummaryTabProps) => {
  const { overview, decisions, assignees, unresolvedItems } = summary;

  return (
    <div className="flex flex-col gap-3 px-5 py-5">
      <AiSummaryBanner currentCredits={currentCredits} />

      <SummaryCard title="회의 개요">
        <ul className="flex flex-col gap-2">
          <BulletItem label="일시">{overview.period}</BulletItem>
          <BulletItem label="참석자">{overview.participants.join(', ')}</BulletItem>
          <BulletItem label="회의 목적">{overview.purpose}</BulletItem>
        </ul>
      </SummaryCard>

      <SummaryCard title="결정사항">
        <ol className="flex flex-col gap-2.5">
          {decisions.map((decision, index) => (
            <li key={decision} className="flex items-start gap-3 text-sm leading-6 text-cool-600">
              <span className="w-3 shrink-0 text-cool-500">{index + 1}</span>
              {decision}
            </li>
          ))}
        </ol>
      </SummaryCard>

      <SummaryCard title="담당자 및 역할">
        <ul className="flex flex-col gap-3.5">
          {assignees.map(({ name, role }) => (
            <li key={name} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700"
              >
                {name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-cool-900">{name}</p>
                <p className="mt-0.5 text-sm leading-6 text-cool-600">{role}</p>
              </div>
            </li>
          ))}
        </ul>
      </SummaryCard>

      <SummaryCard title="미해결 논의">
        <ul className="flex flex-col gap-2">
          {unresolvedItems.map((item) => (
            <BulletItem key={item}>{item}</BulletItem>
          ))}
        </ul>
      </SummaryCard>

      <p className="px-1 pt-1 pb-2 text-xs leading-5 text-cool-500">
        AI가 요약한 결과라 정확하지 않을 수 있어요. 중요한 내용은 전사에서 확인해주세요.
      </p>
    </div>
  );
};
