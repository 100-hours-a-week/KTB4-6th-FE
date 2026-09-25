import type { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  children: ReactNode;
}

export const SummaryCard = ({ title, children }: SummaryCardProps) => (
  <section className="rounded-2xl border border-cool-200 bg-white p-4">
    <h2 className="text-base font-bold text-cool-900">{title}</h2>
    <div className="mt-3">{children}</div>
  </section>
);
