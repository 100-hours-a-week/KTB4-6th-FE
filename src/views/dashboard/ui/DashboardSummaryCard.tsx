import { cn, formatDurationSeconds } from '@/shared/lib';
import { DASHBOARD_INFO, type DashboardInfoKey } from '../model/dashboard-info';
import { DashboardInfoPopover } from './DashboardInfoPopover';

interface DashboardSummaryCardProps {
  totalMeetings: number;
  totalDurationSeconds: number;
  averageDurationSeconds: number;
  overtimeRate: number;
  contextOutSeconds: number;
}

interface SummaryRow {
  infoKey: DashboardInfoKey;
  value: string;
  suffix?: string;
  isWarning?: boolean;
}

const EMPTY_VALUE = '–';

const formatOvertimeRate = (rate: number) => {
  const roundedRate = Math.round(rate);
  return roundedRate > 0 ? `+${roundedRate}%` : '0%';
};

export const DashboardSummaryCard = ({
  totalMeetings,
  totalDurationSeconds,
  averageDurationSeconds,
  overtimeRate,
  contextOutSeconds,
}: DashboardSummaryCardProps) => {
  const hasMeetings = totalMeetings > 0;
  const totalDuration = formatDurationSeconds(totalDurationSeconds);
  const rows: SummaryRow[] = hasMeetings
    ? [
        { infoKey: 'averageDuration', value: formatDurationSeconds(averageDurationSeconds) },
        {
          infoKey: 'overtimeRate',
          value: formatOvertimeRate(overtimeRate),
          isWarning: Math.round(overtimeRate) > 0,
        },
        {
          infoKey: 'contextOut',
          value: formatDurationSeconds(contextOutSeconds),
          suffix: `/ ${totalDuration}`,
        },
      ]
    : [
        { infoKey: 'averageDuration', value: EMPTY_VALUE },
        { infoKey: 'overtimeRate', value: EMPTY_VALUE },
        { infoKey: 'contextOut', value: EMPTY_VALUE },
      ];

  return (
    <section
      aria-label="회의 시간 요약"
      className="flex flex-col rounded-[20px] bg-white shadow-[0_2px_12px_rgba(31,53,85,0.07)]"
    >
      <div className="flex flex-col gap-1.5 rounded-t-[20px] bg-brand-600 px-5 py-3.5 shadow-[0_6px_16px_rgba(47,76,116,0.18)]">
        <h2 className="text-[14.5px] font-semibold tracking-[-0.015em] text-brand-100">
          총 회의 시간
        </h2>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[28px] leading-none font-semibold tracking-[-0.03em] whitespace-nowrap text-white tabular-nums">
            {hasMeetings ? totalDuration : EMPTY_VALUE}
          </span>
          <span className="text-[13.5px] font-medium whitespace-nowrap text-brand-100">
            {hasMeetings ? `종료된 회의 ${totalMeetings}개` : '종료된 회의 없음'}
          </span>
        </div>
      </div>

      <dl className="flex flex-col px-[18px]">
        {rows.map((row, index) => (
          <div
            key={row.infoKey}
            className={cn(
              'flex min-h-[50px] items-center justify-between gap-3',
              index > 0 && 'border-t border-cool-100',
            )}
          >
            <dt className="flex min-w-0 items-center">
              <span className="text-sm font-medium tracking-[-0.01em] whitespace-nowrap text-cool-600">
                {DASHBOARD_INFO[row.infoKey].label}
              </span>
              <DashboardInfoPopover infoKey={row.infoKey} />
            </dt>
            <dd className="flex shrink-0 items-baseline gap-[5px]">
              <span
                className={cn(
                  'text-[17px] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap tabular-nums',
                  row.isWarning ? 'text-danger' : 'text-cool-900',
                )}
              >
                {row.value}
              </span>
              {row.suffix && (
                <span className="text-[12.5px] font-medium whitespace-nowrap text-cool-500">
                  {row.suffix}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
