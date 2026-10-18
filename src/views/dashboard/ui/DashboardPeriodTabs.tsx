const PERIODS = [
  { value: 'daily', label: '일간', description: '목표 대비 회의 시간' },
  { value: 'weekly', label: '주간', description: '목표 초과 회의 비율' },
] as const;

export type DashboardPeriod = (typeof PERIODS)[number]['value'];

interface DashboardPeriodTabsProps {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}

export const DashboardPeriodTabs = ({ value, onChange }: DashboardPeriodTabsProps) => (
  <div className="shrink-0 border-b border-cool-200 bg-white px-[22px] pt-1 pb-3.5">
    <div
      role="group"
      aria-label="대시보드 조회 유형"
      className="grid grid-cols-2 gap-1 rounded-[14px] bg-cool-100 p-1"
    >
      {PERIODS.map((period) => (
        <button
          key={period.value}
          type="button"
          aria-pressed={period.value === value}
          onClick={() => onChange(period.value)}
          className={`flex h-[50px] flex-col items-center justify-center gap-1 rounded-[11px] transition-colors ${
            period.value === value
              ? 'bg-white text-cool-900 shadow-[0_1px_3px_rgba(22,30,43,0.12)]'
              : 'text-cool-500'
          }`}
        >
          <span className="text-[14px] leading-none font-semibold">{period.label}</span>
          <span
            className={`text-[11.5px] leading-none ${period.value === value ? 'text-brand-600' : ''}`}
          >
            {period.description}
          </span>
        </button>
      ))}
    </div>
  </div>
);
