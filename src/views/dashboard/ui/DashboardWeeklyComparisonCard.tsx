import type { ReactNode } from 'react';
import { formatDurationSeconds } from '@/shared/lib';
import { DASHBOARD_INFO } from '../model/dashboard-info';
import type { SelectedWeeklyDaySummary } from '../model/weekly-dashboard-view';
import { DashboardInfoPopover } from './DashboardInfoPopover';

interface DashboardWeeklyComparisonCardProps {
  totalMeetings: number;
  totalDurationSeconds: number;
  overtimeMeetings: number;
  overtimeRate: number;
  selectedDay: SelectedWeeklyDaySummary | null;
  dateNavigator: ReactNode;
  onOpenDaily: () => void;
  children?: ReactNode;
}

export const DashboardWeeklyComparisonCard = ({
  totalMeetings,
  totalDurationSeconds,
  overtimeMeetings,
  overtimeRate,
  selectedDay,
  dateNavigator,
  onOpenDaily,
  children,
}: DashboardWeeklyComparisonCardProps) => {
  const hasMeetings = totalMeetings > 0;

  return (
    <section
      aria-labelledby="dashboard-weekly-comparison-title"
      className="motion-safe:animate-in motion-safe:fade-in flex shrink-0 flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_2px_12px_rgba(31,53,85,0.07)] motion-safe:duration-200"
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
            id="dashboard-weekly-comparison-title"
            className="text-[17px] font-bold tracking-[-0.02em] text-cool-900"
          >
            {DASHBOARD_INFO.weeklyOvertime.label}
          </h2>
          <DashboardInfoPopover infoKey="weeklyOvertime" />
        </div>

        {dateNavigator}

        <div className="flex min-h-[46px] items-center justify-between gap-2.5 rounded-[11px] bg-cool-50 px-3.5">
          <span className="text-[13px] font-semibold tracking-[-0.01em] text-cool-900">
            회의 {totalMeetings}개 중 {overtimeMeetings}개 초과
          </span>
          <span className="text-[17px] leading-none font-semibold text-danger tabular-nums">
            {Math.round(overtimeRate)}%
          </span>
        </div>

        <div className="h-[190px]">{children}</div>

        {selectedDay && (
          <div aria-live="polite" className="rounded-[12px] bg-cool-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13.5px] font-semibold tracking-[-0.01em] text-cool-900">
                {selectedDay.dateLabel}
              </span>
              <button
                type="button"
                onClick={onOpenDaily}
                className="group flex items-center gap-0.5 rounded-lg px-1.5 py-1 text-[12.5px] font-semibold text-brand-600 transition-[color,background-color,transform] hover:bg-brand-100 hover:text-brand-700 active:scale-95"
              >
                회의별로 보기
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  ›
                </span>
              </button>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <div className="rounded-[10px] bg-white px-3 py-2.5 text-center">
                <span className="block text-[11.5px] text-cool-500">총 회의 시간</span>
                <strong className="mt-1 block text-[15px] font-semibold text-cool-900 tabular-nums">
                  {selectedDay.totalDuration}
                </strong>
              </div>
              <div className="rounded-[10px] bg-white px-3 py-2.5 text-center">
                <span className="block text-[11.5px] text-cool-500">평균 회의 시간</span>
                <strong className="mt-1 block text-[15px] font-semibold text-cool-900 tabular-nums">
                  {selectedDay.averageDuration}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
