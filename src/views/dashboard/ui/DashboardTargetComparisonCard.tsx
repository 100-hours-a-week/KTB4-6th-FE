import type { ReactNode } from 'react';
import { DASHBOARD_INFO } from '../model/dashboard-info';
import type { SelectedBucketView } from '../model/target-comparison-view';
import { DashboardInfoPopover } from './DashboardInfoPopover';

interface DashboardTargetComparisonCardProps {
  selectedBucket: SelectedBucketView;
  children?: ReactNode;
}

export const DashboardTargetComparisonCard = ({
  selectedBucket,
  children,
}: DashboardTargetComparisonCardProps) => (
  <section
    aria-labelledby="dashboard-target-comparison-title"
    className="mt-1.5 flex flex-col gap-3.5 rounded-[20px] bg-white px-4 pt-4 pb-3.5 shadow-[0_2px_12px_rgba(31,53,85,0.07)]"
  >
    <div className="flex items-center justify-between gap-2">
      <h2
        id="dashboard-target-comparison-title"
        className="text-[17px] font-bold tracking-[-0.02em] text-cool-900"
      >
        {DASHBOARD_INFO.targetComparison.label}
      </h2>
      <DashboardInfoPopover infoKey="targetComparison" />
    </div>

    <div aria-live="polite" className="flex flex-col gap-1.5 px-0.5">
      <p className="text-[15px] font-semibold tracking-[-0.01em] text-cool-900">
        {selectedBucket.range}
      </p>
      <p className="flex gap-1.5 text-[13px] leading-[1.2] whitespace-nowrap text-cool-600">
        <span>{selectedBucket.detail}</span>
        {selectedBucket.overtime && (
          <span className="font-semibold text-danger">{selectedBucket.overtime}</span>
        )}
      </p>
    </div>

    <div className="h-[260px]">{children}</div>
  </section>
);
