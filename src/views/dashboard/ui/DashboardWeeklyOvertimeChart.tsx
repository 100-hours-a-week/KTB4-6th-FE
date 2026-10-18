'use client';

import type { WeeklyDashboardBar } from '../model/weekly-dashboard-view';
import {
  DashboardWeeklyChartControls,
  DashboardWeeklyEmptyBars,
} from './DashboardWeeklyChartOverlays';
import { DashboardWeeklyChartPlot } from './DashboardWeeklyChartPlot';

interface DashboardWeeklyOvertimeChartProps {
  bars: WeeklyDashboardBar[];
  onSelect: (date: string) => void;
}

export const DashboardWeeklyOvertimeChart = ({
  bars,
  onSelect,
}: DashboardWeeklyOvertimeChartProps) => (
  <div className="relative h-full min-h-0 w-full min-w-0">
    <DashboardWeeklyEmptyBars bars={bars} />
    <div className="pointer-events-none absolute inset-0 z-10">
      <DashboardWeeklyChartPlot bars={bars} />
    </div>
    <DashboardWeeklyChartControls bars={bars} onSelect={onSelect} />
  </div>
);
