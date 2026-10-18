import type { WeeklyDashboardBar } from '../model/weekly-dashboard-view';
import {
  DASHBOARD_WEEKLY_X_AXIS_HEIGHT,
  DASHBOARD_WEEKLY_Y_AXIS_WIDTH,
} from './dashboard-weekly-chart-layout';

interface DashboardWeeklyChartOverlayProps {
  bars: WeeklyDashboardBar[];
}

interface DashboardWeeklyChartControlsProps extends DashboardWeeklyChartOverlayProps {
  onSelect: (date: string) => void;
}

const overlayStyle = {
  bottom: DASHBOARD_WEEKLY_X_AXIS_HEIGHT,
  left: DASHBOARD_WEEKLY_Y_AXIS_WIDTH,
};

export const DashboardWeeklyEmptyBars = ({ bars }: DashboardWeeklyChartOverlayProps) => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute top-0 right-0 z-10 grid grid-cols-7"
    style={overlayStyle}
  >
    {bars.map((bar) => (
      <span key={bar.date} className="flex min-w-0 items-end justify-center">
        {bar.meetingCount === 0 && (
          <span className="h-[16%] w-6 rounded-t-[4px] border-[1.5px] border-dashed border-cool-300" />
        )}
      </span>
    ))}
  </div>
);

export const DashboardWeeklyChartControls = ({
  bars,
  onSelect,
}: DashboardWeeklyChartControlsProps) => (
  <div className="absolute top-0 right-0 z-20 grid grid-cols-7" style={overlayStyle}>
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
);
