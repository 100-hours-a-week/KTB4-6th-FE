'use client';

import {
  Bar,
  BarChart,
  type BaseTickContentProps,
  Cell,
  DefaultZIndexes,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@/shared/lib';
import type { WeeklyDashboardBar } from '../model/weekly-dashboard-view';
import { DashboardGoalMetMarker } from './DashboardGoalMetMarker';

interface DashboardWeeklyOvertimeChartProps {
  bars: WeeklyDashboardBar[];
  onSelect: (date: string) => void;
}

const CHART_MARGIN = { top: 8, right: 0, bottom: 0, left: 0 };
const Y_AXIS_WIDTH = 42;
const X_AXIS_HEIGHT = 28;

const RateTick = ({ x, y, payload }: BaseTickContentProps) => (
  <text
    x={x}
    y={y}
    textAnchor="end"
    dominantBaseline="central"
    className="fill-cool-500 text-[11.5px] font-medium"
  >
    {payload.value}%
  </text>
);

export const DashboardWeeklyOvertimeChart = ({
  bars,
  onSelect,
}: DashboardWeeklyOvertimeChartProps) => (
  <div className="relative h-full min-h-0 w-full min-w-0">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 right-0 z-10 grid grid-cols-7"
      style={{ bottom: X_AXIS_HEIGHT, left: Y_AXIS_WIDTH }}
    >
      {bars.map((bar) => (
        <span key={bar.date} className="flex min-w-0 items-end justify-center">
          {bar.meetingCount === 0 && (
            <span className="h-[16%] w-6 rounded-t-[4px] border-[1.5px] border-dashed border-cool-300" />
          )}
        </span>
      ))}
    </div>

    <div className="pointer-events-none absolute inset-0 z-10">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={0}
        initialDimension={{ width: 320, height: 190 }}
      >
        <BarChart data={bars} margin={CHART_MARGIN} accessibilityLayer={false}>
          <YAxis
            width={Y_AXIS_WIDTH}
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            axisLine={false}
            tickLine={false}
            tickSize={0}
            tickMargin={6}
            interval={0}
            tick={RateTick}
          />
          <XAxis
            dataKey="label"
            height={X_AXIS_HEIGHT}
            axisLine={false}
            tickLine={false}
            tickMargin={9}
            interval={0}
            tick={({ x, y, payload }: BaseTickContentProps) => {
              const bar = bars.find(({ label }) => label === payload.value);

              return (
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="hanging"
                  className={cn(
                    'text-[11.5px] font-medium',
                    bar?.isFuture ? 'fill-cool-300' : 'fill-cool-500',
                    bar?.isSelected && 'fill-cool-900 font-semibold',
                  )}
                >
                  {payload.value}
                </text>
              );
            }}
          />
          {[50, 100].map((tick) => (
            <ReferenceLine
              key={tick}
              y={tick}
              stroke="var(--color-cool-100)"
              zIndex={DefaultZIndexes.grid}
            />
          ))}
          <ReferenceLine y={0} stroke="var(--color-cool-200)" zIndex={DefaultZIndexes.grid} />
          {bars
            .filter(
              ({ meetingCount, overtimeMeetings }) => meetingCount > 0 && overtimeMeetings === 0,
            )
            .map((bar) => (
              <ReferenceDot
                key={bar.date}
                x={bar.label}
                y={0}
                r={12}
                shape={(props) => <DashboardGoalMetMarker {...props} isSelected={bar.isSelected} />}
              />
            ))}
          <Bar
            dataKey="overtimeRate"
            barSize={24}
            minPointSize={(value) => (value === 0 ? 0 : 4)}
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          >
            {bars.map((bar) => (
              <Cell
                key={bar.date}
                fill={
                  bar.isFuture
                    ? 'transparent'
                    : bar.isSelected
                      ? 'var(--color-danger)'
                      : 'color-mix(in srgb, var(--color-danger) 70%, white)'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div
      className="absolute top-0 right-0 z-20 grid grid-cols-7"
      style={{ bottom: X_AXIS_HEIGHT, left: Y_AXIS_WIDTH }}
    >
      {bars.map((bar) => (
        <button
          key={bar.date}
          type="button"
          disabled={bar.isFuture}
          aria-label={
            bar.meetingCount === 0
              ? `${bar.date}, 회의 없음`
              : bar.overtimeMeetings === 0
                ? `${bar.date}, 목표 시간 초과 회의 없음`
                : `${bar.date}, 목표 시간 초과 회의 비율 ${bar.overtimeRate}%`
          }
          aria-pressed={bar.isSelected}
          onClick={() => onSelect(bar.date)}
          className="min-w-0 rounded-[10px]"
        />
      ))}
    </div>
  </div>
);
