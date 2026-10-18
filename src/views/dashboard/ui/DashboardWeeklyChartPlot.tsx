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
import {
  DASHBOARD_WEEKLY_CHART_MARGIN,
  DASHBOARD_WEEKLY_X_AXIS_HEIGHT,
  DASHBOARD_WEEKLY_Y_AXIS_WIDTH,
} from './dashboard-weekly-chart-layout';

interface DashboardWeeklyChartPlotProps {
  bars: WeeklyDashboardBar[];
}

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

export const DashboardWeeklyChartPlot = ({ bars }: DashboardWeeklyChartPlotProps) => (
  <ResponsiveContainer
    width="100%"
    height="100%"
    minWidth={0}
    minHeight={0}
    initialDimension={{ width: 320, height: 190 }}
  >
    <BarChart data={bars} margin={DASHBOARD_WEEKLY_CHART_MARGIN} accessibilityLayer={false}>
      <YAxis
        width={DASHBOARD_WEEKLY_Y_AXIS_WIDTH}
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
        height={DASHBOARD_WEEKLY_X_AXIS_HEIGHT}
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
        .filter(({ meetingCount, overtimeMeetings }) => meetingCount > 0 && overtimeMeetings === 0)
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
);
