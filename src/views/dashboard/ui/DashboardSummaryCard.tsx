import { formatDurationSeconds } from '@/shared/lib';
import { DASHBOARD_INFO } from '../model/dashboard-info';
import { DashboardInfoPopover } from './DashboardInfoPopover';

interface DashboardSummaryCardProps {
  totalMeetings: number;
  averageDurationSeconds: number;
  overtimeMeetings: number;
  contextOutSeconds: number;
  contextOutRate: number;
  totalDurationSeconds: number;
}

interface SummaryMetricProps {
  infoKey: 'averageDuration' | 'goalAchievement';
  value: string;
  suffix?: string;
  progressRate?: number;
  hasDivider?: boolean;
}

const EMPTY_VALUE = '–';
const CONTEXT_RING_RADIUS = 26;
const CONTEXT_RING_CIRCUMFERENCE = 2 * Math.PI * CONTEXT_RING_RADIUS;

const clampRate = (rate: number) => Math.min(100, Math.max(0, rate));

const SummaryMetric = ({
  infoKey,
  value,
  suffix,
  progressRate,
  hasDivider = false,
}: SummaryMetricProps) => (
  <div
    className={`flex min-w-0 flex-col gap-2.5 px-[18px] pt-[15px] pb-3.5 ${
      hasDivider ? 'border-l border-cool-100' : ''
    }`}
  >
    <div className="flex min-w-0 items-center">
      <span className="text-[13.5px] leading-none font-medium tracking-[-0.01em] whitespace-nowrap text-cool-600">
        {DASHBOARD_INFO[infoKey].label}
      </span>
      <DashboardInfoPopover infoKey={infoKey} />
    </div>

    <div className="flex min-w-0 items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-[21px] leading-none font-semibold tracking-[-0.025em] text-cool-900 tabular-nums">
        {value}
      </span>
      {suffix && (
        <span className="text-[12.5px] leading-none font-medium text-cool-600 tabular-nums">
          {suffix}
        </span>
      )}
    </div>

    {progressRate !== undefined && (
      <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-brand-600"
          style={{ width: `${clampRate(progressRate)}%` }}
        />
      </div>
    )}
  </div>
);

export const DashboardSummaryCard = ({
  totalMeetings,
  averageDurationSeconds,
  overtimeMeetings,
  contextOutSeconds,
  contextOutRate,
  totalDurationSeconds,
}: DashboardSummaryCardProps) => {
  const hasMeetings = totalMeetings > 0;
  const achievedMeetings = Math.max(0, totalMeetings - overtimeMeetings);
  const achievementRate = hasMeetings ? Math.round((achievedMeetings / totalMeetings) * 100) : 0;
  const roundedContextOutRate = Math.round(clampRate(contextOutRate));
  const contextRingLength = (roundedContextOutRate / 100) * CONTEXT_RING_CIRCUMFERENCE;

  return (
    <section
      aria-label="회의 지표 요약"
      className="grid grid-cols-2 rounded-[20px] bg-white shadow-[0_2px_12px_rgba(31,53,85,0.07)]"
    >
      <SummaryMetric
        infoKey="averageDuration"
        value={hasMeetings ? formatDurationSeconds(averageDurationSeconds) : EMPTY_VALUE}
      />
      <SummaryMetric
        infoKey="goalAchievement"
        value={hasMeetings ? `${achievementRate}%` : EMPTY_VALUE}
        suffix={hasMeetings ? `${achievedMeetings}/${totalMeetings}개` : undefined}
        progressRate={hasMeetings ? achievementRate : undefined}
        hasDivider
      />

      <div className="col-span-2 mx-[18px] flex items-center gap-3.5 border-t border-cool-100 py-[13px]">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex min-w-0 items-center">
            <span className="text-[13.5px] leading-none font-medium tracking-[-0.01em] whitespace-nowrap text-cool-600">
              {DASHBOARD_INFO.contextOut.label}
            </span>
            <DashboardInfoPopover infoKey="contextOut" />
          </div>
          <span className="text-[21px] leading-none font-semibold tracking-[-0.025em] whitespace-nowrap text-cool-900 tabular-nums">
            {hasMeetings ? formatDurationSeconds(contextOutSeconds) : EMPTY_VALUE}
          </span>
          {hasMeetings && (
            <span className="text-[12.5px] leading-none text-cool-600">
              총 회의 시간 {formatDurationSeconds(totalDurationSeconds)} 중
            </span>
          )}
        </div>

        {hasMeetings && (
          <div
            className="relative size-[58px] shrink-0"
            aria-label={`맥락 이탈 비율 ${roundedContextOutRate}%`}
          >
            <svg aria-hidden="true" viewBox="0 0 64 64" className="size-[58px]">
              <circle
                cx="32"
                cy="32"
                r={CONTEXT_RING_RADIUS}
                fill="none"
                stroke="var(--color-warning-bg)"
                strokeWidth="7"
              />
              <circle
                cx="32"
                cy="32"
                r={CONTEXT_RING_RADIUS}
                fill="none"
                stroke="var(--color-warning)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${contextRingLength} ${CONTEXT_RING_CIRCUMFERENCE}`}
                transform="rotate(-90 32 32)"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-warning tabular-nums">
              {roundedContextOutRate}%
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
