import type { DotProps } from 'recharts';

interface DashboardGoalMetMarkerProps extends DotProps {
  isSelected: boolean;
}

export const DashboardGoalMetMarker = ({
  cx = 0,
  cy = 0,
  isSelected,
}: DashboardGoalMetMarkerProps) => {
  const size = isSelected ? 24 : 20;
  const offset = size / 2;
  const checkScale = size / 16;

  return (
    <g opacity={isSelected ? 1 : 0.82}>
      <rect
        x={cx - offset}
        y={cy - offset}
        width={size}
        height={size}
        rx={size * 0.25}
        fill="var(--color-success)"
      />
      <path
        d={`M ${cx - 3.5 * checkScale} ${cy} L ${cx - checkScale} ${cy + 2.5 * checkScale} L ${cx + 4 * checkScale} ${cy - 3 * checkScale}`}
        fill="none"
        stroke="white"
        strokeWidth={1.8 * checkScale}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
};
