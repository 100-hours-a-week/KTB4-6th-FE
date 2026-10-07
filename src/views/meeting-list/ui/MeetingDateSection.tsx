import type { ReactNode } from 'react';

interface MeetingDateSectionProps {
  label: string;
  meetingCount: number;
  children: ReactNode;
}

export const MeetingDateSection = ({ label, meetingCount, children }: MeetingDateSectionProps) => (
  <section>
    <h3 className="flex items-baseline gap-2">
      <span className="text-[15px] font-semibold text-brand-800">{label}</span>
      <span className="text-[13px] text-cool-500">회의 {meetingCount}개</span>
    </h3>
    <ol className="mt-3">{children}</ol>
  </section>
);
