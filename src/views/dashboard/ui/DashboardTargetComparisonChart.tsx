'use client';

import {
  Bar,
  BarChart,
  type BarShapeProps,
  type BaseTickContentProps,
  DefaultZIndexes,
  Rectangle,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
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
import { DashboardGoalMetMarker } from './DashboardGoalMetMarker';

interface DashboardTargetComparisonChartProps {
  meetings: DashboardMeetingData[];
  selectedMeetingId: number | null;
  onSelect: (meetingId: number) => void;
}

const CHART_MARGIN = { top: 10, right: 0, bottom: 10, left: 0 };
const Y_AXIS_WIDTH = 44;

const mixWithWhite = (color: string, percent: number) =>
  `color-mix(in srgb, var(${color}) ${percent}%, white)`;

const DifferenceTick = ({ x, y, payload }: BaseTickContentProps) => (
  <text
    x={x}
    y={y}
    textAnchor="end"
    dominantBaseline="central"
    className={cn(
      'text-[11.5px]',
      payload.value === 0 ? 'fill-cool-600 font-semibold' : 'fill-cool-500 font-medium',
    )}
  >
    {formatTargetDifferenceTick(payload.value)}
  </text>
);

const DifferenceBar = ({ x, y, width, height, payload }: BarShapeProps) => {
  const bar = payload as TargetComparisonBar;
  const isOver = bar.differenceMinutes > 0;

  if (bar.differenceMinutes === 0) return <></>;

  const color = isOver ? '--color-danger' : '--color-brand-500';

  return (
    <Rectangle
      x={x}
      y={Math.min(y, y + height)}
      width={width}
      height={Math.max(4, Math.abs(height))}
      radius={isOver ? [3, 3, 0, 0] : [0, 0, 3, 3]}
      fill={
        bar.isSelected
          ? isOver
            ? mixWithWhite(color, 85)
            : 'var(--color-brand-500)'
          : mixWithWhite(color, 60)
      }
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
    <div className="relative h-full min-h-0 w-full min-w-0">
      <div className="pointer-events-none absolute inset-0 z-10">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
          initialDimension={{ width: 320, height: 176 }}
        >
          <BarChart data={bars} margin={CHART_MARGIN} accessibilityLayer={false}>
            <XAxis dataKey="meetingId" height={0} hide />
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
            {bars
              .filter(({ differenceMinutes }) => differenceMinutes === 0)
              .map((bar) => (
                <ReferenceDot
                  key={bar.meetingId}
                  x={bar.meetingId}
                  y={0}
                  r={12}
                  shape={(props) => (
                    <DashboardGoalMetMarker {...props} isSelected={bar.isSelected} />
                  )}
                />
              ))}
            <Bar
              dataKey="differenceMinutes"
              barSize={barSize}
              minPointSize={4}
              shape={DifferenceBar}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="absolute top-0 right-0 bottom-0 z-20 flex" style={{ left: Y_AXIS_WIDTH }}>
        {bars.map((bar) => (
          <button
            key={bar.meetingId}
            type="button"
            aria-label={`${bar.title}, ${
              bar.differenceMinutes === 0
                ? '목표와 같음'
                : formatTargetDifferenceTick(Math.round(bar.differenceMinutes))
            }`}
            aria-pressed={bar.isSelected}
            onClick={() => onSelect(bar.meetingId)}
            className="min-w-0 flex-1 rounded-[10px]"
          />
        ))}
      </div>
    </div>
  );
};
