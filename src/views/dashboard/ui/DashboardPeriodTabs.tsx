import { DASHBOARD_PERIOD_DAYS, type DashboardPeriodDays } from '@/features/dashboard';
import { cn } from '@/shared/lib';

interface DashboardPeriodTabsProps {
  selectedDays: DashboardPeriodDays;
  onSelect: (days: DashboardPeriodDays) => void;
}

export const DashboardPeriodTabs = ({ selectedDays, onSelect }: DashboardPeriodTabsProps) => (
  <div className="shrink-0 border-b border-cool-200 bg-white px-[22px] pt-1 pb-3.5">
    <div
      role="group"
      aria-label="조회 기간"
      className="grid grid-cols-4 gap-1 rounded-full bg-cool-100 p-1"
    >
      {DASHBOARD_PERIOD_DAYS.map((days) => {
        const isSelected = days === selectedDays;

        return (
          <button
            key={days}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(days)}
            className={cn(
              'h-9 rounded-full text-[13px] transition-colors',
              isSelected
                ? 'bg-white font-semibold text-cool-900 shadow-[0_1px_3px_rgba(22,30,43,0.12)]'
                : 'font-medium text-cool-500 hover:text-cool-700',
            )}
          >
            최근 {days}일
          </button>
        );
      })}
    </div>
  </div>
);
