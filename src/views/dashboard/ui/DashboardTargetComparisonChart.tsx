'use client';

import {
  Bar,
  BarChart,
  type BarShapeProps,
  type BaseTickContentProps,
  DefaultZIndexes,
  Rectangle,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@/shared/lib';
import {
  formatTargetRate,
  formatTargetRateTick,
  getTargetDeviationDomain,
  isRateLabelVisible,
  type TargetComparisonBar,
  type TargetComparisonRange,
  toTargetComparisonBars,
} from '../model/target-comparison-view';

interface DashboardTargetComparisonChartProps {
  ranges: TargetComparisonRange[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const CHART_MARGIN = { top: 18, right: 0, bottom: 0, left: 0 };
const Y_AXIS_WIDTH = 44;
const X_AXIS_HEIGHT = 42;
const BAR_SIZE = 22;
const BAR_RADIUS = 6;
const RATE_LABEL_GAP = 11;

const mixWithWhite = (color: string, percent: number) =>
  `color-mix(in srgb, var(${color}) ${percent}%, white)`;

const BAR_COLORS = {
  over: {
    selected: mixWithWhite('--color-danger', 85),
    default: mixWithWhite('--color-danger', 45),
  },
  under: { selected: 'var(--color-brand-500)', default: mixWithWhite('--color-brand-500', 45) },
};

const getBarValue = (bar: TargetComparisonBar) => bar.rate ?? 0;

const RateTick = ({ x, y, payload }: BaseTickContentProps) => {
  const isTarget = payload.value === 0;

  return (
    <text
      x={x}
      y={y}
      textAnchor="end"
      dominantBaseline="central"
      className={cn(
        'text-[11.5px]',
        isTarget ? 'fill-cool-600 font-semibold' : 'fill-cool-500 font-medium',
      )}
    >
      {formatTargetRateTick(payload.value)}
    </text>
  );
};

const RangeTick = ({
  x,
  y,
  payload,
  isSelected,
}: BaseTickContentProps & { isSelected: boolean }) => (
  <text
    x={x}
    y={y}
    textAnchor="middle"
    dominantBaseline="central"
    className={cn('text-[12.5px]', isSelected ? 'fill-cool-900 font-semibold' : 'fill-cool-500')}
  >
    {payload.value}
  </text>
);

const RateBar = ({ x, y, width, height, payload }: BarShapeProps) => {
  const bar = payload as TargetComparisonBar;
  const { rate, isSelected } = bar;
  const top = Math.min(y, y + height);
  const barHeight = Math.abs(height);
  const isOver = rate !== null && rate > 0;
  const isUnder = rate !== null && rate < 0;
  const colors = isOver ? BAR_COLORS.over : BAR_COLORS.under;

  return (
    <g>
      {(isOver || isUnder) && (
        <Rectangle
          x={x}
          y={top}
          width={width}
          height={barHeight}
          radius={isOver ? [BAR_RADIUS, BAR_RADIUS, 0, 0] : [0, 0, BAR_RADIUS, BAR_RADIUS]}
          style={{ fill: isSelected ? colors.selected : colors.default }}
        />
      )}
      {isRateLabelVisible(bar) && (
        <text
          x={x + width / 2}
          y={isUnder ? top + barHeight + RATE_LABEL_GAP : top - RATE_LABEL_GAP}
          textAnchor="middle"
          dominantBaseline="central"
          className={cn(
            'text-[11.5px] font-semibold tabular-nums',
            isOver ? 'fill-danger' : isUnder ? 'fill-brand-500' : 'fill-cool-500',
          )}
        >
          {formatTargetRate(rate)}
        </text>
      )}
    </g>
  );
};

export const DashboardTargetComparisonChart = ({
  ranges,
  selectedIndex,
  onSelect,
}: DashboardTargetComparisonChartProps) => {
  const bars = toTargetComparisonBars(ranges, selectedIndex);
  const [minRate, maxRate] = getTargetDeviationDomain(bars.map((bar) => bar.rate));

  return (
    <div className="relative h-full">
      <div
        className="absolute top-0 right-0 flex"
        style={{ left: Y_AXIS_WIDTH, bottom: X_AXIS_HEIGHT - CHART_MARGIN.top }}
      >
        {bars.map((bar, index) => (
          <button
            key={bar.rangeLabel}
            type="button"
            aria-label={bar.rangeLabel}
            aria-pressed={bar.isSelected}
            onClick={() => onSelect(index)}
            className={cn('min-w-0 flex-1 rounded-[10px]', bar.isSelected && 'bg-brand-50')}
          />
        ))}
      </div>

      <BarChart
        data={bars}
        margin={CHART_MARGIN}
        responsive
        accessibilityLayer={false}
        aria-hidden
        style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <XAxis
          dataKey="label"
          height={X_AXIS_HEIGHT}
          axisLine={false}
          tickLine={false}
          tickSize={0}
          tickMargin={36}
          interval={0}
          tick={(props: BaseTickContentProps) => (
            <RangeTick {...props} isSelected={props.index === selectedIndex} />
          )}
        />
        <YAxis
          width={Y_AXIS_WIDTH}
          domain={[minRate, maxRate]}
          ticks={[minRate, 0, maxRate]}
          axisLine={false}
          tickLine={false}
          tickSize={0}
          tickMargin={6}
          interval={0}
          tick={RateTick}
        />
        <ReferenceLine y={maxRate} stroke="var(--color-cool-100)" zIndex={DefaultZIndexes.grid} />
        <ReferenceLine y={minRate} stroke="var(--color-cool-100)" zIndex={DefaultZIndexes.grid} />
        <ReferenceLine
          y={0}
          stroke="var(--color-cool-500)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          zIndex={DefaultZIndexes.grid}
        />
        <Bar dataKey={getBarValue} barSize={BAR_SIZE} shape={RateBar} />
      </BarChart>
    </div>
  );
};
