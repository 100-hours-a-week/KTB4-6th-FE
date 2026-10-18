'use client';

import {
  Bar,
  BarChart,
  type BarShapeProps,
  type BaseTickContentProps,
  DefaultZIndexes,
  Rectangle,
  ReferenceLine,
  YAxis,
} from 'recharts';
import type { DashboardMeetingData } from '@/features/dashboard';
import { cn } from '@/shared/lib';
import {
  formatTargetDifferenceTick,
  getTargetDifferenceScale,
  type TargetComparisonBar,
  toTargetComparisonBars,
} from '../model/target-comparison-view';

interface DashboardTargetComparisonChartProps {
  meetings: DashboardMeetingData[];
  selectedMeetingId: number | null;
  onSelect: (meetingId: number | null) => void;
}

const CHART_MARGIN = { top: 10, right: 0, bottom: 10, left: 0 };
const Y_AXIS_WIDTH = 44;
const BAR_RADIUS = 6;

const mixWithWhite = (color: string, percent: number) =>
  `color-mix(in srgb, var(${color}) ${percent}%, white)`;

const BAR_COLORS = {
  over: {
    selected: mixWithWhite('--color-danger', 85),
    default: mixWithWhite('--color-danger', 60),
  },
  under: {
    selected: 'var(--color-brand-500)',
    default: mixWithWhite('--color-brand-500', 60),
  },
};

const DifferenceTick = ({ x, y, payload }: BaseTickContentProps) => {
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
      {formatTargetDifferenceTick(payload.value)}
    </text>
  );
};

const DifferenceBar = ({ x, y, width, height, payload }: BarShapeProps) => {
  const bar = payload as TargetComparisonBar;
  const { differenceMinutes, isSelected } = bar;
  const isOver = differenceMinutes > 0;
  const isUnder = differenceMinutes < 0;
  const colors = isOver ? BAR_COLORS.over : BAR_COLORS.under;
  const top = Math.min(y, y + height);
  const barHeight = Math.max(4, Math.abs(height));

  if (!isOver && !isUnder) return null;

  return (
    <Rectangle
      x={x}
      y={top}
      width={width}
      height={barHeight}
      radius={isOver ? [BAR_RADIUS, BAR_RADIUS, 0, 0] : [0, 0, BAR_RADIUS, BAR_RADIUS]}
      style={{ fill: isSelected ? colors.selected : colors.default }}
    />
  );
};

export const DashboardTargetComparisonChart = ({
  meetings,
  selectedMeetingId,
  onSelect,
}: DashboardTargetComparisonChartProps) => {
  const bars = toTargetComparisonBars(meetings, selectedMeetingId);
  const { domain, ticks } = getTargetDifferenceScale(
    bars.map(({ differenceMinutes }) => differenceMinutes),
  );
  const barSize = meetings.length > 10 ? 10 : 22;

  return (
    <div className="relative h-full">
      <div className="absolute top-0 right-0 bottom-0 z-10 flex" style={{ left: Y_AXIS_WIDTH }}>
        {bars.map((bar) => (
          <button
            key={bar.meetingId}
            type="button"
            aria-label={`${bar.title}, ${formatTargetDifferenceTick(Math.round(bar.differenceMinutes))}`}
            aria-pressed={bar.isSelected}
            onClick={() => onSelect(bar.isSelected ? null : bar.meetingId)}
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
        <YAxis
          width={Y_AXIS_WIDTH}
          domain={domain}
          ticks={ticks}
          axisLine={false}
          tickLine={false}
          tickSize={0}
          tickMargin={6}
          interval={0}
          tick={DifferenceTick}
        />
        {ticks
          .filter((tick) => tick !== 0)
          .map((tick) => (
            <ReferenceLine
              key={tick}
              y={tick}
              stroke="var(--color-cool-100)"
              zIndex={DefaultZIndexes.grid}
            />
          ))}
        <ReferenceLine
          y={0}
          stroke="var(--color-cool-500)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          zIndex={DefaultZIndexes.grid}
        />
        <Bar dataKey="differenceMinutes" barSize={barSize} minPointSize={4} shape={DifferenceBar} />
      </BarChart>
    </div>
  );
};
