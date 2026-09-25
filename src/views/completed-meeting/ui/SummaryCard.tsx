import type { ReactNode } from 'react';

interface SummaryCardProps {
  /** 제목이 없는 내용(제목 앞의 문단 등)이면 null */
  title: string | null;
  children: ReactNode;
}

export const SummaryCard = ({ title, children }: SummaryCardProps) => (
  <section className="rounded-2xl border border-cool-200 bg-white p-4">
    {title && <h2 className="mb-3 text-base font-bold text-cool-900">{title}</h2>}
    {children}
  </section>
);
