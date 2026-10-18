'use client';

import { useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { addDashboardDays, type DashboardDateRange } from '@/features/dashboard';
import { cn, useAppFrameElement } from '@/shared/lib';
import {
  DASHBOARD_WEEKDAYS,
  getDashboardAvailableMonths,
  getDashboardCalendarWeeks,
  getDashboardMonthKey,
  moveDashboardMonth,
  parseDashboardCalendarDate,
} from '../model/dashboard-week-calendar';
import { formatDashboardWeekRange } from '../model/weekly-dashboard-view';

interface DashboardWeekPickerDialogProps {
  range: DashboardDateRange;
  today: string;
  minWeekStart: string;
  maxWeekStart: string;
  onSelect: (weekStart: string) => void;
  onClose: () => void;
}

export const DashboardWeekPickerDialog = ({
  range,
  today,
  minWeekStart,
  maxWeekStart,
  onSelect,
  onClose,
}: DashboardWeekPickerDialogProps) => {
  const frame = useAppFrameElement();
  const [displayedMonth, setDisplayedMonth] = useState(() => getDashboardMonthKey(range.from));
  const weeks = getDashboardCalendarWeeks(displayedMonth);
  const availableMonths = getDashboardAvailableMonths(minWeekStart, maxWeekStart);
  const minMonth = getDashboardMonthKey(minWeekStart);
  const maxMonth = getDashboardMonthKey(maxWeekStart);

  const handleSelect = (weekStart: string) => {
    onSelect(weekStart);
    onClose();
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal container={frame}>
        <Dialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/45" />
        <Dialog.Popup className="absolute inset-x-5 top-1/2 z-[90] -translate-y-1/2 rounded-[22px] bg-white px-5 pt-5 pb-4 shadow-[0_20px_48px_rgba(20,34,56,0.24)] outline-none">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-[17px] font-bold tracking-[-0.02em] text-cool-900">
              조회할 주 선택
            </Dialog.Title>
            <Dialog.Close
              aria-label="주 선택 닫기"
              className="flex size-8 items-center justify-center rounded-full text-cool-500 hover:bg-cool-100"
            >
              <X aria-hidden="true" className="size-4.5" strokeWidth={2} />
            </Dialog.Close>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              aria-label="이전 달"
              disabled={displayedMonth <= minMonth}
              onClick={() => setDisplayedMonth(moveDashboardMonth(displayedMonth, -1))}
              className="flex size-9 items-center justify-center rounded-full text-cool-700 hover:bg-cool-100 disabled:text-cool-300"
            >
              <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={2} />
            </button>
            <select
              aria-label="조회 월 선택"
              value={displayedMonth}
              onChange={(event) => setDisplayedMonth(event.target.value)}
              className="rounded-lg bg-transparent px-2 py-1 text-[15px] font-semibold text-cool-900 outline-none hover:bg-cool-100 focus-visible:ring-2 focus-visible:ring-brand-300"
            >
              {availableMonths.map((monthKey) => {
                const [year, month] = monthKey.split('-').map(Number);

                return (
                  <option key={monthKey} value={monthKey}>
                    {year}년 {month}월
                  </option>
                );
              })}
            </select>
            <button
              type="button"
              aria-label="다음 달"
              disabled={displayedMonth >= maxMonth}
              onClick={() => setDisplayedMonth(moveDashboardMonth(displayedMonth, 1))}
              className="flex size-9 items-center justify-center rounded-full text-cool-700 hover:bg-cool-100 disabled:text-cool-300"
            >
              <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 text-center">
            {DASHBOARD_WEEKDAYS.map((weekday) => (
              <span key={weekday} className="py-1 text-[12px] font-medium text-cool-500">
                {weekday}
              </span>
            ))}
          </div>

          <div className="mt-1 flex flex-col gap-1">
            {weeks.map(({ weekStart, days }) => {
              const isAvailable = weekStart >= minWeekStart && weekStart <= maxWeekStart;
              const isSelected = weekStart === range.from;
              const weekRange = { from: weekStart, to: addDashboardDays(weekStart, 6) };

              return (
                <button
                  key={weekStart}
                  type="button"
                  disabled={!isAvailable}
                  aria-label={`${formatDashboardWeekRange(weekRange)} 주간`}
                  aria-pressed={isSelected}
                  onClick={() => handleSelect(weekStart)}
                  className={cn(
                    'grid h-9 grid-cols-7 items-center rounded-[10px] text-[13.5px] transition-colors',
                    isSelected
                      ? 'bg-brand-100 font-semibold text-brand-700 ring-1 ring-brand-300 ring-inset'
                      : isAvailable
                        ? 'text-cool-900 hover:bg-cool-100'
                        : 'text-cool-300',
                  )}
                >
                  {days.map((date) => {
                    const day = parseDashboardCalendarDate(date).getUTCDate();
                    const isDisplayedMonth = getDashboardMonthKey(date) === displayedMonth;

                    return (
                      <span
                        key={date}
                        className={cn(
                          'mx-auto flex size-7 items-center justify-center rounded-full',
                          !isDisplayedMonth && 'text-cool-400',
                          date > today && 'text-cool-300',
                          date === today && 'ring-1.5 ring-brand-600 ring-inset',
                        )}
                      >
                        {day}
                      </span>
                    );
                  })}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleSelect(maxWeekStart)}
            className="mt-4 h-10 w-full rounded-[10px] bg-brand-50 text-sm font-semibold text-brand-600 hover:bg-brand-100"
          >
            이번 주로 이동
          </button>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
