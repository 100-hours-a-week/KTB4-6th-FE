'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DashboardDateRange } from '@/features/dashboard';
import { formatDashboardWeekRange } from '../model/weekly-dashboard-view';
import { DashboardWeekPickerDialog } from './DashboardWeekPickerDialog';

interface DashboardWeekNavigatorProps {
  range: DashboardDateRange;
  today: string;
  minWeekStart: string;
  maxWeekStart: string;
  canMovePrevious: boolean;
  canMoveNext: boolean;
  onSelect: (weekStart: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const DashboardWeekNavigator = ({
  range,
  today,
  minWeekStart,
  maxWeekStart,
  canMovePrevious,
  canMoveNext,
  onSelect,
  onPrevious,
  onNext,
}: DashboardWeekNavigatorProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <>
      <div className="mx-[-4px] flex min-h-10 items-center justify-between gap-2">
        <button
          type="button"
          aria-label="이전 주"
          disabled={!canMovePrevious}
          onClick={onPrevious}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cool-100 text-cool-900 transition-colors hover:bg-cool-200 disabled:bg-transparent disabled:text-cool-300"
        >
          <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={2} />
        </button>

        <button
          type="button"
          aria-label="조회 주 선택"
          aria-haspopup="dialog"
          onClick={() => setIsPickerOpen(true)}
          className="min-h-10 min-w-0 flex-1 rounded-[10px] px-3 text-[14.5px] font-semibold tracking-[-0.01em] whitespace-nowrap text-cool-900 transition-colors hover:bg-cool-100"
        >
          {formatDashboardWeekRange(range)}
        </button>

        <button
          type="button"
          aria-label="다음 주"
          disabled={!canMoveNext}
          onClick={onNext}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cool-100 text-cool-900 transition-colors hover:bg-cool-200 disabled:bg-transparent disabled:text-cool-300"
        >
          <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2} />
        </button>
      </div>

      {isPickerOpen && (
        <DashboardWeekPickerDialog
          range={range}
          today={today}
          minWeekStart={minWeekStart}
          maxWeekStart={maxWeekStart}
          onSelect={onSelect}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </>
  );
};
