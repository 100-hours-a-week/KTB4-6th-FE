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
  formatTargetRateTick,
  getTargetDeviationDomain,
  type TargetComparisonBar,
  type TargetComparisonRange,
  toTargetComparisonBars,
} from '../model/target-comparison-view';

interface DashboardTargetComparisonChartProps {
  ranges: TargetComparisonRange[];
}

const CHART_MARGIN = { top: 18, right: 0, bottom: 0, left: 0 };
const Y_AXIS_WIDTH = 44;
const X_AXIS_HEIGHT = 42;
const BAR_SIZE = 22;
const BAR_RADIUS = 6;
const OVER_BAR_COLOR = 'color-mix(in srgb, var(--color-danger) 45%, white)';
const UNDER_BAR_COLOR = 'color-mix(in srgb, var(--color-brand-500) 45%, white)';

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

const RangeTick = ({ x, y, payload }: BaseTickContentProps) => (
  <text
    x={x}
    y={y}
    textAnchor="middle"
    dominantBaseline="central"
    className="fill-cool-500 text-[12.5px]"
  >
    {payload.value}
  </text>
);

const RateBar = ({ x, y, width, height, payload }: BarShapeProps) => {
  const { rate } = payload as TargetComparisonBar;
  if (rate === null || rate === 0) return null;

  const isOver = rate > 0;

  return (
    <Rectangle
      x={x}
      y={Math.min(y, y + height)}
      width={width}
      height={Math.abs(height)}
      radius={isOver ? [BAR_RADIUS, BAR_RADIUS, 0, 0] : [0, 0, BAR_RADIUS, BAR_RADIUS]}
      style={{ fill: isOver ? OVER_BAR_COLOR : UNDER_BAR_COLOR }}
    />
  );
};

export const DashboardTargetComparisonChart = ({ ranges }: DashboardTargetComparisonChartProps) => {
  const bars = toTargetComparisonBars(ranges);
  const [minRate, maxRate] = getTargetDeviationDomain(bars.map((bar) => bar.rate));

  return (
    <BarChart
      data={bars}
      margin={CHART_MARGIN}
      responsive
      style={{ width: '100%', height: '100%' }}
    >
      <XAxis
        dataKey="label"
        height={X_AXIS_HEIGHT}
        axisLine={false}
        tickLine={false}
        tickSize={0}
        tickMargin={36}
        interval={0}
        tick={RangeTick}
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
      <Bar dataKey="rate" barSize={BAR_SIZE} shape={RateBar} />
    </BarChart>
  );
};
