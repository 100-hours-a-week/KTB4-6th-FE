import type { ReactNode } from 'react';
import { formatDurationSeconds } from '@/shared/lib';
import { DASHBOARD_INFO } from '../model/dashboard-info';
import type { SelectedMeetingSummary } from '../model/target-comparison-view';
import { DashboardInfoPopover } from './DashboardInfoPopover';

interface DashboardTargetComparisonCardProps {
  totalMeetings: number;
  totalDurationSeconds: number;
  selectedMeetingSummary: SelectedMeetingSummary | null;
  dateNavigator: ReactNode;
  children?: ReactNode;
}

export const DashboardTargetComparisonCard = ({
  totalMeetings,
  totalDurationSeconds,
  selectedMeetingSummary,
  dateNavigator,
  children,
}: DashboardTargetComparisonCardProps) => {
  const hasMeetings = totalMeetings > 0;

  return (
    <section
      aria-labelledby="dashboard-target-comparison-title"
      className="flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_2px_12px_rgba(31,53,85,0.07)]"
    >
      <div className="flex items-end justify-between gap-2.5 bg-brand-600 px-5 py-4">
        <div className="flex min-w-0 flex-col gap-2.5">
          <span className="text-[14px] leading-none font-semibold tracking-[-0.015em] text-brand-100">
            총 회의 시간
          </span>
          <span className="text-[30px] leading-none font-semibold tracking-[-0.03em] whitespace-nowrap text-white tabular-nums">
            {hasMeetings ? formatDurationSeconds(totalDurationSeconds) : '–'}
          </span>
        </div>
        <span className="pb-0.5 text-[13px] leading-none font-medium whitespace-nowrap text-brand-100">
          {hasMeetings ? `종료된 회의 ${totalMeetings}개` : '종료된 회의 없음'}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 px-4 pt-3.5 pb-3">
        <div className="flex items-center justify-between gap-2">
          <h2
            id="dashboard-target-comparison-title"
            className="text-[17px] font-bold tracking-[-0.02em] text-cool-900"
          >
            {DASHBOARD_INFO.targetComparison.label}
          </h2>
          <DashboardInfoPopover infoKey="targetComparison" />
        </div>

        {dateNavigator}

        {hasMeetings ? (
          <>
            <div
              aria-live="polite"
              className="flex min-h-[46px] items-center justify-between gap-2.5 rounded-[11px] bg-cool-50 px-3.5"
            >
              {selectedMeetingSummary ? (
                <>
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="truncate text-[13px] leading-[1.2] font-semibold tracking-[-0.01em] text-cool-900">
                      {selectedMeetingSummary.title}
                    </p>
                    <p className="text-[12px] leading-[1.1] whitespace-nowrap text-cool-600">
                      {selectedMeetingSummary.detail}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[16px] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap tabular-nums ${
                      selectedMeetingSummary.differenceType === 'over'
                        ? 'text-danger'
                        : selectedMeetingSummary.differenceType === 'under'
                          ? 'text-brand-500'
                          : 'text-cool-600'
                    }`}
                  >
                    {selectedMeetingSummary.difference}
                  </span>
                </>
              ) : (
                <span className="flex-1 text-center text-[12.5px] leading-[1.3] text-cool-500">
                  막대를 누르면 자세히 볼 수 있어요
                </span>
              )}
            </div>

            <div className="h-[176px]">{children}</div>

            <div className="flex items-center justify-center gap-3.5 text-[12px] leading-none font-medium text-cool-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 border-t-[1.5px] border-dashed border-cool-500" />
                목표 시간
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-[3px] bg-danger" />
                초과
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-[3px] bg-brand-500" />
                단축
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-[176px] flex-col items-center justify-center gap-1.5 rounded-[10px] bg-cool-50">
            <p className="text-sm leading-[1.3] font-medium text-cool-600">
              이 날 종료된 회의가 없어요
            </p>
            <p className="text-[12.5px] leading-[1.3] text-cool-500">
              회의가 끝나면 여기에 표시돼요
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
